Bot commands:
-------------
!open - opens up race entry (admin only)

!howtorace - gives directions on how to join a race, leave a race, and finish or forfeit a race

!join, !enter - entrants in the race should type one of these to join the race
                (only functions while the entry period is open)

!unjoin - for entrants to use to exit a race before it begins (only functions while
          the entry period is open)

!start - this closes the race entry, starts a countdown from 10, then initiates the
         race (admin only)

!restart, !reset - this moves the race back to the race entry period (unfortunately, 
                   due to the nature of Javascript, the !start countdown continues)
                   (admin only)

!forfeit, !quit - entrants should use one of these to quit/forfeit the race, e.g., 
                  in case of a death (only after the race starts)

!done - entrants should type this to indicate they *successfully* completed the run

!entrants - lists all current entrants in the race (admin only)

!bop <username> - to remove a user from the race (at any point), type !bop followed by
                  the username of the person you wish to remove from the race (admin only)
