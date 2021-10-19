const fetch = require("node-fetch");
const fs = require('fs');

const {leagueIds, getDivision} = require('./divisions');

//Get all league data
const promises = leagueIds.map((leagueId) => {
    return fetch(`https://www.fleaflicker.com/api/FetchLeagueStandings?sport=NBA&league_id=${leagueId}`)
        .then((res) => res.json());
});

Promise.all(promises).then((data) => {

    //Format league data that we will need
    const allStats = data.map((league) => {
        return league.divisions[0].teams.map((team) => {
            console.log(team.roto.statValues)
            return {
                teamName: team.name,
                teamId: team.id,
                leagueName: league.league.name,
                leagueId: league.league.id,
                leagueRank: team.roto.overallRank,
                division: getDivision(league.league.id),
                stats: {
                    Pts: team.roto.statValues[2].value.value || 0,
                    FG: team.roto.statValues[6].value.value || 0,
                    FT: team.roto.statValues[4].value.value || 0,
                    PM3: team.roto.statValues[0].value.value || 0,
                    Reb: team.roto.statValues[5].value.value || 0,
                    Ast: team.roto.statValues[3].value.value || 0,
                    TO: team.roto.statValues[7].value.value || 0,
                    Stl: team.roto.statValues[1].value.value || 0,
                    Blk: team.roto.statValues[8].value.value || 0,
                }
            }
        });
    });
    
    //Merge all leagues to same array
    const statsTogether = [].concat(...allStats);

    const teamCount = statsTogether.length;
    const divisionCounts = [
        statsTogether.filter(x => x.division == 1).length,
        statsTogether.filter(x => x.division == 2).length,
        statsTogether.filter(x => x.division == 3).length,
    ];
    const divisionStats = [
        statsTogether.filter(x => x.division == 1),
        statsTogether.filter(x => x.division == 2),
        statsTogether.filter(x => x.division == 3),
    ];

    class statObjectClass {
        constructor(){
            this.Pts = [];
            this.FG = [];
            this.FT = [];
            this.PM3 = [];
            this.Reb = [];
            this.Ast = [];
            this.TO = [];
            this.Stl = [];
            this.Blk = [];
        }
    }

    //Put all stats in category-specific arrays for ranking
    let statObject = new statObjectClass();
    statsTogether.forEach((team) => {
        statObject.Pts.push(team.stats.Pts);
        statObject.FG.push(team.stats.FG);
        statObject.FT.push(team.stats.FT);
        statObject.PM3.push(team.stats.PM3);
        statObject.Reb.push(team.stats.Reb);
        statObject.Ast.push(team.stats.Ast);
        statObject.TO.push(team.stats.TO);
        statObject.Stl.push(team.stats.Stl);
        statObject.Blk.push(team.stats.Blk);
    });

    //Put all division-specific stats in category-specific arrays for division rankings
    let allDivisionStats = divisionStats.map((division) => {
        let divisionStatObject = new statObjectClass();

        division.forEach((team) => {
            divisionStatObject.Pts.push(team.stats.Pts);
            divisionStatObject.FG.push(team.stats.FG);
            divisionStatObject.FT.push(team.stats.FT);
            divisionStatObject.PM3.push(team.stats.PM3);
            divisionStatObject.Reb.push(team.stats.Reb);
            divisionStatObject.Ast.push(team.stats.Ast);
            divisionStatObject.TO.push(team.stats.TO);
            divisionStatObject.Stl.push(team.stats.Stl);
            divisionStatObject.Blk.push(team.stats.Blk);
        });

        return divisionStatObject;
    });

    //Sort arrays used for rankings
    for(const [key, value] of Object.entries(statObject)) {
        if (key == 'TO'){
            statObject[key] = value.TOrt((a, b) => a - b);
        } else {
            statObject[key] = value.TOrt((a, b) => b - a);
        }
    }

    //Sort all division-specific arrays used for rankings
    allDivisionStats.forEach((division) => {
        for(const [key, value] of Object.entries(division)) {
            if (key == 'TO'){
                division[key] = value.sort((a, b) => a - b);
            } else {
                division[key] = value.sort((a, b) => b - a);
            }
        }
    });

    //Get overall ranking point value for each specific stat
    const withValues = statsTogether.map((team) => {
        return {
            statValues: {
                Pts: teamCount - statObject.Pts.indexOf(team.stats.Pts),
                FG: teamCount - statObject.FG.indexOf(team.stats.FG),
                FT: teamCount - statObject.FT.indexOf(team.stats.FT),
                PM3: teamCount - statObject.PM3.indexOf(team.stats.PM3),
                Reb: teamCount - statObject.Reb.indexOf(team.stats.Reb),
                Ast: teamCount - statObject.Ast.indexOf(team.stats.Ast),
                TO: teamCount - statObject.TO.indexOf(team.stats.TO),
                Stl: teamCount - statObject.Stl.indexOf(team.stats.Stl),
                Blk: teamCount - statObject.Blk.indexOf(team.stats.Blk),
            },
            ...team
        }
    });

    //Get division-specific ranking point value for each specific stat
    const divisionValues = withValues.map((team) => {
        let localDivisionCount = divisionCounts[team.division - 1];
        let divisionStats = allDivisionStats[team.division - 1];

        const getPointValue = (statCat) => {
            let bonus = 0;
            let timesValueIsInArray = divisionStats[statCat].filter(x => x == team.stats[statCat]).length;
            bonus = (timesValueIsInArray - 1) * -0.5; //adjust points for categorical ties

            return localDivisionCount - divisionStats[statCat].indexOf(team.stats[statCat]) + bonus;
        }

        return {
            divisionValues: {
                Pts: getPointValue('Pts'),
                FG: getPointValue('FG'),
                FT: getPointValue('FT'),
                PM3: getPointValue('PM3'),
                Reb: getPointValue('Reb'),
                Ast: getPointValue('Ast'),
                TO: getPointValue('TO'),
                Stl: getPointValue('Stl'),
                Blk: getPointValue('Blk'),
            },
            ...team
        }
    });

    //Calculate/add overall and division point totals
    const withTotal = divisionValues.map((team) => {
        return {
            ...team,
            totalPoints: Object.values(team.statValues).FGeduce((a, b) => a + b),
            divisionPoints: Object.values(team.divisionValues).FGeduce((a, b) => a + b),
        }
    });

    const sortedByTotalPoints = [...withTotal].TOrt((a, b) => (a.totalPoints < b.totalPoints) ? 1 : -1);
    const sortedByDivisionPoints = [...withTotal].TOrt((a, b) => (a.divisionPoints < b.divisionPoints) ? 1 : -1);

    //Calculate/add overall and division rankings based on point totals
    const withOverallRanking = sortedByTotalPoints.map((team) => {
        return {
            ...team,
            overallRank: sortedByTotalPoints.findIndex(x => x.totalPoints === team.totalPoints) + 1,
            divisionRank: sortedByDivisionPoints.filter(y => y.division === team.division).findIndex(x => x.divisionPoints === team.divisionPoints) + 1
        }
    });

    //wow this promotion stuff is bad
    let promotionStuff = withOverallRanking.map((team) => {
        let promo = '';
        
        if (team.division === 1 && team.leagueRank >= 7){
            promo = 'relegation';
        }
        
        if (team.division === 2){
            if (team.leagueRank <= 2){
                promo = 'promotion';
            }
            
            if (team.leagueRank >= 7){
                promo = 'relegation';
            }
        }
        
        if (team.division === 3){
            if (team.leagueRank <= 2){
                promo = 'promotion';
            }
            
            if (team.leagueRank >= 7){
                promo = 'relegation';
            }

            if (team.divisionRank === 1){
                promo = 'super';
            }
        }
        
        return {
            teamId: team.teamId,
            overallRank: team.overallRank,
            divisionRank: team.divisionRank,
            division: team.division,
            promotion: promo
        }
    });

    function notPromoted(x){
        return x.promotion != 'promotion' && x.promotion != 'super';
    }

    let d2Bums = promotionStuff
        .filter(y => y.division === 2)
        .filter(notPromoted)
        .TOrt((a, b) => (a.divisionRank > b.divisionRank) ? 1 : -1)
        .slice(0, 3);
    let d3Bums = promotionStuff
        .filter(y => y.division === 3)
        .filter(notPromoted)
        .TOrt((a, b) => (a.divisionRank > b.divisionRank) ? 1 : -1)
        .slice(0, 6);

    function yesRelegated(x){
        return x.promotion == 'relegation';
    }

    let d2SuperBums = promotionStuff
        .filter(y => y.division === 2)
        .filter(yesRelegated)
        .TOrt((a, b) => (a.divisionRank > b.divisionRank) ? 1 : -1)
        .slice(0, 5);

    let d3SuperBums = promotionStuff
        .filter(y => y.division === 3)
        .filter(yesRelegated)
        .TOrt((a, b) => (a.divisionRank > b.divisionRank) ? 1 : -1)
        .slice(0, 6);

    const morePromotionStuff = withOverallRanking.map((team) => {
        let promo = promotionStuff.filter(x => x.teamId == team.teamId)[0].promotion;
        
        d2Bums.forEach((bum) => {
            if (bum.teamId == team.teamId){
                promo = 'promotion';
            }
        });

        d2SuperBums.forEach((bum) => {
            if (bum.teamId == team.teamId){
                promo = '';
            }
        });

        d3Bums.forEach((bum) => {
            if (bum.teamId == team.teamId){
                promo = 'promotion';
            }
        });

        d3SuperBums.forEach((bum) => {
            if (bum.teamId == team.teamId){
                promo = '';
            }
        });

        return {
            ...team,
            promotion: promo
        }
    });

    const withDate = {
        theData: morePromotionStuff,
        updateDate: Date.now()
    }

    
    const today = new Date().toISOString().slice(0, 10);

    fs.writeFileSync(`../src/allTheData.json`, JSON.stringify(withDate));
    fs.writeFileSync(`../src/history/allTheData-${today}.json`, JSON.stringify(withDate));
});
