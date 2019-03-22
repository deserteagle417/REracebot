const fs = require('fs');

module.exports = class Race {
    constructor(client) {
        this.trigger = '!';
        this.client = client;
        this.races = {};
        this.admins = ['testUser1, testUser3, testUser5' ];
    }

    open(channel, user) {
        if (this.races[channel] !== undefined) {
            return this.client.action(channel, `Please end the current race before starting a new one.`);
        }

        if (this.admins.indexOf(user) === -1) {
            return this.client.action(channel, 'Please ask an admin to open the race.');
        }
        
        const date = new Date();
        const log_filename = `${channel}_${date.toISOString()}.txt`;

        this.races[channel] = {
            start_time: null,
            place: 0,
            forfeits: 0,
            racers: {},
            results: [],
            log: fs.createWriteStream(log_filename, {flags: 'a'})
        };

        this.client.action(channel, `${user} has initiated a race, type ${this.trigger}join to enter!`);
        this.log(channel, `${user} opened a race.`);
        this.log_breakline(channel);
        this.log(channel,'Pre-race');
        this.log_breakline(channel);
    }

    join(channel, user) {
        if (!this.is_race_open(channel)) {
            return this.client.action(channel, `The race has already started or ended. Be sure to join the next race!`);
        }

        if (!this.is_user_in_race(channel, user)) {
            this.races[channel].racers[user] = {
                end_time: null,
                place: 0,
                forfeit: false
            };

            this.client.action(channel, `${user} has joined the race! There are ${this.racer_count(channel)} entrants.`);
            this.log(channel, `${user} joined the race.`);
        } else {
            this.client.action(channel, `${user} has already joined the race.`);
        }
    }

    bop_user(channel, user, bopped_user) {
        if (typeof bopped_user === 'string') {
            bopped_user = bopped_user.toLowerCase();
        }
        
        if (this.admins.indexOf(user) === -1) {
            return this.client.action(channel, `Who do you think you are ${user}?! FUNgineer`);
        } else if (this.races[channel] === undefined) {
            return this.client.action(channel, `Can't bop anyone if there's no race! NotLikeThis`);
        } else if (this.races[channel] !== undefined && bopped_user === undefined) {
            return this.client.action(channel, `I can't bop anyone if you don't tell me who to bop! OpieOP`);
        } else if (bopped_user === undefined || !this.is_user_in_race(channel, bopped_user)) {
            return this.client.action(channel, `How you gonna try and bop someone not in the race?! cmonBruh`);
        }

        const user_info = this.races[channel].racers[bopped_user];

        if (user_info.end_time !== null) {
            this.races[channel].place--;
        }
        if (user_info.forfeit) {
            this.races[channel].forfeits--;
        }

        let results = this.races[channel].results;
        if (results.length > 0 && results.indexOf(bopped_user) > -1) {
            results.splice(results.indexOf(bopped_user), 1);
            this.races[channel].results = results;
        }

        delete this.races[channel].racers[bopped_user];
        this.client.action(channel, `Fuck outta here, ${bopped_user}! Jebaited`);
        this.log(channel, `${bopped_user} was removed from the race by ${user}.`);
        this.end(channel, 'internal_system_call');
    }

    unjoin(channel, user) {
        if (this.is_race_open(channel)) {
            if (this.is_user_in_race(channel, user)) {
                delete this.races[channel].racers[user];

                this.client.action(channel, `${user} has left the race. There are ${this.racer_count(channel)} entrants.`);
                this.log(channel, `${user} left the race.`);
            } else {
                this.client.action(channel, `${user} is currently not in race.`);
            }
        } else {
            this.client.action(channel, `Race has already started. Please use ${this.trigger}quit instead.`);
        }
    }

    forfeit(channel, user) {
        if (this.is_race_open(channel)) {
            return this.client.action(channel, `The race has is currently open. Join with ${this.trigger}join`);
        }

        if (this.is_user_in_race(channel, user)) {
            this.races[channel].forfeits++;
            this.races[channel].racers[user].forfeit = true;

            this.client.action(channel, `${user} has quit the race.`);

            this.log(channel, `${user} has forfeit the race.`);
            this.end(channel, 'internal_system_call');
            
        }
    }

    done(channel, user) {
        if (this.is_race_open(channel)) {
            return this.client.action(channel, `The race entry period is currently open. Join with ${this.trigger}join or unenter with ${this.trigger}unjoin.`);
        }

        if (this.is_user_in_race(channel, user)) {
            let userInfo = this.races[channel].racers[user];
            const start_time = this.races[channel].start_time;

            if (userInfo.forfeit) {
                return this.client.action(channel, `${user} has already forfeited the race.`);
            }

            this.races[channel].place++;
            const place = this.races[channel].place;
            userInfo.end_time = Date.now();
            userInfo.place = place;
            const time = this.final_time(start_time, userInfo.end_time);

            this.races[channel].results.push(user);
            const date = new Date();

            this.client.action(channel, `${user} has finished in ${this.ordinal(place)} place with a time of ${time}`);
            this.log(channel, `${user} finished in ${this.ordinal(place)} place with a time of ${time}.`);
            this.end(channel, 'internal_system_call');
        } else {
            this.client.action(channel, `${user} is not in current race.`);
        }
    }

    start(channel, user) {
        if (!this.is_race_open(channel)) {
            return this.client.action(channel, `The race has already started.`);
        }

        if (this.admins.indexOf(user) === -1) {
            return this.client.action(channel, 'Please ask an admin to start the race.');
        }

        const _this = this;
        this.client.action(channel, `Entry for the race has been closed.`);
        this.client.action(channel, `The race will begin in 10 seconds!`);

        if (this.racer_count(channel) >= 2) {
            this.races[channel].start_time = -1;

            setTimeout(function () {
                _this.client.action(channel, `5`)
            }, 5000);
            setTimeout(function () {
                _this.client.action(channel, `4`)
            }, 6000);
            setTimeout(function () {
                _this.client.action(channel, `3`)
            }, 7000);
            setTimeout(function () {
                _this.client.action(channel, `2`)
            }, 8000);
            setTimeout(function () {
                _this.client.action(channel, `1`)
            }, 9000);
            setTimeout(function () {
                _this.client.action(channel, `GO!`);
                _this.races[channel].start_time = Date.now();
                
                _this.log(channel, `The race started!!`);
                _this.log_breakline(channel);
                _this.log(channel,'During Race');
                _this.log_breakline(channel);
            }, 10000);
        } else {
            _this.client.action(channel, `You need at least 2 people for a race! DansGame`);
        }
    }

    restart(channel, user) {
        if (this.races[channel] === undefined) {
            return this.client.action(channel, `There is currently no race in progress.`);
        }

        if (this.admins.indexOf(user) === -1) {
            return this.client.action(channel, 'Please ask an admin to reset the race.');
        }

        this.races[channel].start_time = null;
        this.client.action(channel, `Current race has been reset. Use ${this.trigger}start to create a new countdown.`);

        this.log(channel, `The race was reset.`);
    }

    end(channel, user) {
        if (this.races[channel] === undefined) {
            return this.client.action(channel, `How about you open the race first... DansGame`);
        }

        const race = this.races[channel];
        const racers = Object.keys(race.racers);
        const everyone_has_finished = racers.length === (race.place + race.forfeits);
        const is_admin = this.admins.indexOf(user) > -1;
        const is_internal = user === 'internal_system_call';

        if (!is_internal && !is_admin && !everyone_has_finished) {
            this.client.action(channel, `Not all racers have ${this.trigger}done. Please have a moderator end the race.`)
        } else if (is_admin || everyone_has_finished) {
            this.print_results(channel);
            this.races[channel].log.end();
            delete this.races[channel];
            this.client.action(channel, 'The race has ended.');
        }
    }

    print_results(channel) {
        const _this = this;
        const results = this.races[channel].results;
        this.log(channel, 'The race has ended.');
        this.log_breakline(channel);
        this.log(channel,'Final Rankings');
        this.log_breakline(channel);

        this.client.action(channel, 'Final times:');
        const start_time = this.races[channel].start_time;

        results.forEach(function (racer, index) {
            const racer_info = _this.races[channel].racers[racer];

            if (!racer_info.forfeit) {
                const time = _this.final_time(start_time, racer_info.end_time);
                const place = index + 1;

                _this.client.action(channel, `${place}. ${racer} ${time}`);
                _this.log(channel, `${place}. ${racer} ${time}`)
            }
        });
        this.log_breakline(channel);
    }

    shoutout(channel) {
        if (this.races[channel] === undefined) {
            return this.client.action("No current races are in progress.");
        }

        const racers = Object.keys(this.races[channel].racers);
        let msg = "The following runners have entered the race:";
        let i = 1;

        if (racers.length === 0) {
            return this.client.action(channel, "No racers have joined this race.");
        }

        racers.forEach(function (racer) {
            msg = msg + racer;

            if (i < racers.length) {
                msg = msg + " - ";
            }
        });

        this.client.action(channel, msg);
    }

    test(channel,user) {
        if (this.admins.indexOf(user) === -1) {
            return;
        }
        const _this = this;

        this.open(channel, 'testUser1');
        this.join(channel, 'testUser2');
        this.join(channel, 'testUser1');
        this.join(channel, 'testUser3');
        this.join(channel, 'testUser4');
        this.join(channel, 'testUser5');
        this.join(channel, 'testUser6');
        this.start(channel, 'testUser3');

        setTimeout(function () {
            _this.client.action('Test: lateUser tries joining the race');
            _this.join(channel, 'lateUser');
        }, 15000);

        setTimeout(function () {
            _this.client.action(channel, 'Test: testUser2 finishes the race');
            _this.debug(channel);
            _this.done(channel, 'testUser2');
        }, 16000);

        setTimeout(function () {
            _this.client.action(channel, 'Test: testUser1 !forfeit and then !done...');
            _this.forfeit(channel, 'testUser1');
            _this.done(channel, 'testUser1');
        }, 17000);

        setTimeout(function () {
            _this.client.action(channel, 'Test: testUser3 finishes eventually.');
            _this.done(channel, 'testUser3');
        }, 18000);

        setTimeout(function () {
            _this.client.action(channel, 'Test: testUser5 bops testUser4');
            _this.bop_user(channel, 'testUser5', 'testUser4');
        }, 19000);

        setTimeout(function () {
            _this.client.action(channel, 'Test: testUser6 tries to end, then finishes');
            _this.end(channel,'testUser6')
            _this.done(channel, 'testUser6');
        }, 20000);

        setTimeout(function () {
            _this.client.action(channel, 'Test: testUser5 quits.');
            _this.forfeit(channel, 'testUser5');
        }, 21000);

    }

    racer_count(channel) {
        if (this.races[channel] !== undefined) {
            return Object.keys(this.races[channel].racers).length;
        }

        return -1;
    }

    debug(channel) {
        console.log(this.races[channel], this.is_race_open(channel));
    }

    is_race_open(channel) {
        if (this.races[channel] !== undefined) {
            return this.races[channel].start_time === null;
        }

        return false;
    }

    is_user_in_race(channel, user) {
        return this.races[channel] !== undefined
            && this.races[channel].racers[user] !== undefined;
    }

    set_trigger_character(character) {
        this.trigger = character;
    }

    final_time(start_time, finish_time) {
        const hh = Math.floor((finish_time - start_time) / 3600000);
        const mm = Math.floor((finish_time - start_time) / 60000) - 60 * hh;
        const ss = Math.floor((finish_time - start_time) / 1000) - 60 * mm - 3600 * hh;

        return `${hh}:${mm.toString().padStart(2, "0")}:${ss.toString().padStart(2, "0")}`;
    }

    ordinal(i) {
        var j = i % 10;
        var k = i % 100;

        if (j === 1 && k !== 11) {
            return i + 'st';
        }

        if (j === 2 && k !== 12) {
            return i + 'nd';
        }

        if (j === 3 && k !== 13) {
            return i + 'rd';
        }

        return i + 'th';
    }

    log(channel, message) {
        if (this.races[channel] === undefined) {
            return;
        }

        const date = new Date();
        const file_handler = this.races[channel].log;

        file_handler.write("[" + date.toISOString() + " GMT]   " + message + "\r\n");

    }

    log_breakline(channel, character = '=') {
        const file_handler = this.races[channel].log;

        file_handler.write(''.padEnd(60, character) + "\r\n");
    }
};