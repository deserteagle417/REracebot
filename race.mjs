module.exports = class Race {
    constructor(client) {
        this.trigger = '!';
        this.client = client;
        this.races = {};
        this.admins = ['deserteagle417', 'syrelash', 'halfarebel', "lamguin"];
    }

    open(channel, user) {
        if (this.races[channel] !== undefined) {
            return this.client.action(channel, `Please end the current race before starting a new one.`);
        }

        this.races[channel] = {
            start_time: null,
            place: 0,
            forfeits: 0,
            racers: {}
        };

        this.client.action(channel, `${user} has initiated a race, type ${this.trigger}join to enter!`);
    }

    join(channel, user) {
        if (!this.is_race_open(channel)) {
            return this.client.action(channel, `The race has already started or ended. be sure to join the next race!`);
        }

        if (!this.is_user_in_race(channel, user)) {
            this.races[channel].racers[user] = {
                end_time: null,
                place: 0,
                forfeit: false
            };

            this.client.action(channel, `${user} has joined the race! There are ${this.racer_count(channel)} entrants.`);
        } else {
            this.client.action(channel, `${user} has already joined the race.`);
        }
    }

    unjoin(channel, user) {
        if (this.is_race_open(channel)) {
            if (this.is_user_in_race(channel, user)) {
                delete this.races[channel].racers[user];

                this.client.action(channel, `${user} has left the race. There are ${this.racer_count(channel)} entrants.`);
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

            if (user === 'deserteagle417') {
                this.client.action(channel, "Are you fucking kidding me?! Scrub.");
            } else {
                this.client.action(channel, `${user} has quit the race.`);
            }
        }

        if (this.racer_count(channel) === (this.races[channel].place + this.races[channel].forfeits)) {
            delete this.races[channel];

            this.client.action(channel,'The race has ended.');
        }
    }

    done(channel, user) {
        if (this.is_race_open(channel)) {
            return this.client.action(channel, `The race has is currently open. Join with ${this.trigger}join`);
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

            const hour = this.time_hours(start_time, userInfo.end_time);
            const min = this.time_minutes(start_time, userInfo.end_time);
            const sec = this.time_seconds(start_time, userInfo.end_time);

            this.client.action(channel, `${user} has finished in position ${place} with a time of ${hour}:${min.padStart(2, "0")}:${sec.padStart(2, "0")}`);
        } else {
            this.client.action(channel, `${user} is not in current race.`);
        }

        if (this.racer_count(channel) === (this.races[channel].place + this.races[channel].forfeits)) {
            delete this.races[channel];

            this.client.action(channel,'The race has ended.');
        }
    }

    start(channel) {
        if (!this.is_race_open(channel)) {
            return this.client.action(channel, `The race has already started.`);
        }

        const _this = this;
        this.client.action(channel, `Entry for the race has been closed.`);
        this.client.action(channel, `The race will begin in 10 seconds!`);

        if (this.racer_count(channel) >= 2) {
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
            }, 10000);
        } else {
            _this.client.action(channel, `You need at least 2 people for a race! DansGame`);
        }
    }

    restart(channel) {
        if (this.races[channel] === undefined) {
            return this.client.action(channel, `There is currently no race in progress.`);
        }

        this.races[channel].start_time = null;
        this.client.action(channel, `Current race has been reset. Use ${this.trigger}start to create a new countdown.`);
    }

    end(channel, user) {
        if (this.races[channel] === undefined) {
            this.client.action(channel, `How about you open the race first... DansGame`);
        }

        const racers = Object.keys(this.races[channel].racers);
        const everyone_has_finished = racers.length === (this.races[channel].place + this.races[channel].forfeits);
        const is_admin = this.admins.indexOf(user) > -1;

        if (!is_admin && !everyone_has_finished) {
            this.client.action(channel, `Not all racers have ${this.trigger} done. Please have a moderator end the race.`)
        } else if (is_admin || everyone_has_finished) {
            delete this.races[channel];

            this.client.action(channel,'The race has ended.');
        }
    }

    shoutout(channel) {
        if (this.races[channel] === undefined) {
            return this.client.action("No current races are in progress.");
        }

        const racers = Object.keys(this.races[channel].racers);
        let msg = "Be sure to follow the runners. ";
        let i = 1;

        if (racers.length === 0) {
            return this.client.action(channel, "No racers have joined this race.");
        }

        racers.forEach(function(racer) {
            msg = msg + " https://twitch.tv/" + racer;

            if (i < racers.length) {
                msg = msg + " - ";
            }
        });

        this.client.action(channel, msg);
    }

    test(channel) {
        const _this = this;

        this.open(channel, 'deserteagle417');
        this.join(channel, 'Syrelash');
        this.join(channel, 'deserteagle417');
        this.join(channel, 'testUser');
        this.start(channel);

        setTimeout(function() {
            _this.client.action('Test: Test2 joining the race');
            _this.join(channel, 'test2');
        }, 15000);

        setTimeout(function() {
            _this.client.action(channel, 'Test: testUser finishes the race');
            _this.debug(channel);
            _this.done(channel, 'testUser');
        }, 16000);

        setTimeout(function() {
            _this.client.action(channel, 'Test: DE $forfeit and then $done...');
            _this.forfeit(channel, 'deserteagle417');
            _this.done(channel, 'deserteagle417');
        }, 17000);

        setTimeout(function() {
            _this.client.action(channel, 'Test: Syrelash finishes first.');
            _this.done(channel, 'Syrelash');
        }, 18000);

        //setTimeout(function() {
          //  _this.client.action(channel, 'Test: race closed by mod');
            //_this.end(channel, 'Syrelash');
        //}, 19000);
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

    //Next 3 functions are used to compute the hour, minute, and seconds of the finishing time of a user upon calling !done
    time_hours(start_time, finish_time) {
        const hh = Math.floor((finish_time - start_time) / 3600000);
        return hh.toString();
    }

    time_minutes(start_time, finish_time) {
        const hh = Math.floor((finish_time - start_time) / 3600000);
        const mm = Math.floor((finish_time - start_time) / 60000) - 60 * hh;
        return mm.toString();
    }

    time_seconds(start_time, finish_time) {
        const hh = Math.floor((finish_time - start_time) / 3600000);
        const mm = Math.floor((finish_time - start_time) / 60000) - 60 * hh;
        const ss = Math.floor((finish_time - start_time) / 1000) - 60 * mm - 3600 * hh;
        return ss.toString();
    }
};