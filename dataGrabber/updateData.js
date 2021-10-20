const fetch = require("node-fetch");
const fs = require('fs');
const {leagueIds} = require('./divisions');
const fileName = '../src/allTheData.json';
const file = require(fileName);
    
//Get all league data
const promises = leagueIds.map((leagueId) => {
    return fetch(`https://www.fleaflicker.com/api/FetchLeagueStandings?sport=NBA&league_id=${leagueId}`)
        .then((res) => res.json());
});

Promise.all(promises).then((data) => {
    //Format league data that we will need
    const allStats = data.map((league) => {
        return league.divisions[0].teams
    });

    //Merge all leagues to same array
    const statsTogether = [].concat(...allStats);

    file.theData.forEach(team => {
        team.stats.Pts.push(statsTogether.filter(x => x.id == team.teamId)[0].roto.statValues[2].value.value || 0);
        team.stats.FG.push(statsTogether.filter(x => x.id == team.teamId)[0].roto.statValues[6].value.value || 0);
        team.stats.FT.push(statsTogether.filter(x => x.id == team.teamId)[0].roto.statValues[4].value.value || 0);
        team.stats.PM3.push(statsTogether.filter(x => x.id == team.teamId)[0].roto.statValues[0].value.value || 0);
        team.stats.Reb.push(statsTogether.filter(x => x.id == team.teamId)[0].roto.statValues[5].value.value || 0);
        team.stats.Ast.push(statsTogether.filter(x => x.id == team.teamId)[0].roto.statValues[3].value.value || 0);
        team.stats.TO.push(statsTogether.filter(x => x.id == team.teamId)[0].roto.statValues[7].value.value || 0);
        team.stats.Stl.push(statsTogether.filter(x => x.id == team.teamId)[0].roto.statValues[1].value.value || 0);
        team.stats.Blk.push(statsTogether.filter(x => x.id == team.teamId)[0].roto.statValues[8].value.value || 0);
    });
        
    fs.writeFile(fileName, JSON.stringify(file), function writeJSON(err) {
        if (err) return console.log(err);
    });
});

