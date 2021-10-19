const d1List = [28233];
const d2List = [
    28234,
    28250,
];
const d3List = [
    28251,
    28252,
];
const leagueIds = [...d1List, ...d2List, ...d3List];

const getDivision = ((leagueId) => {
    if (d1List.includes(leagueId)){
        return 1;
    }

    if (d2List.includes(leagueId)){
        return 2;
    }

    return 3;
});

module.exports = {
    leagueIds,
    getDivision
}