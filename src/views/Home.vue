<template>
    <div>
        <v-data-table :headers="headers" :items="data" :items-per-page="500">
            <template v-for="(thing, index) in statTypes" v-slot:[`item.stats.${thing}`]="{ item }">
                <v-chip :key="`thing${index}`" :color="getColor(item[statValueLocation][thing])" dark>{{ item.stats[thing] }} ({{ item[statValueLocation][thing] }})</v-chip>
            </template>
            <!-- <template v-slot:[`item.teamName`]="{ item }">
                <v-tooltip top>
                    <template v-slot:activator="{ on, attrs }">
                        <v-icon v-bind="attrs" v-on="on" class="promoIcon" small :color="getPromoColor(item.promotion)">
                            mdi-checkbox-blank-circle
                        </v-icon>
                    </template>
                    <span>{{getPromoText(item.promotion)}}</span>
                </v-tooltip>
                <a target="_blank" :href="`https://www.fleaflicker.com/nba/leagues/${item.leagueId}/teams/${item.teamId}`">{{item.teamName}}</a>
            </template> -->
            <template v-slot:[`item.leagueName`]="{ item }">
                <a target="_blank" :href="`https://www.fleaflicker.com/nba/leagues/${item.leagueId}`">{{item.leagueName}}</a>
            </template>
        </v-data-table>
    </div>
</template>

<script>
import jsonData from "../../src/allTheData.json";

export default {
    name: "App",
    props: {
        selectedDivision: Number
    },
    data: () => ({
        data: jsonData.theData,
        statValueLocation: 'statValues',
        statTypes: ["Pts", "FG", "FT", "PM3", "Reb", "Ast", "TO", "Stl", "Blk"],
        headers: [
            { text: "Team Name", value: "teamName" },
            { text: "League", value: "leagueName" },
            { text: "League Ranking", value: "leagueRank" },
            { text: "Overall Ranking", value: "overallRank" },
            { text: "Total Points", value: "totalPoints" },

            { text: "Pts", value: "stats.Pts" },
            { text: "FG%", value: "stats.FG" },
            { text: "FT%", value: "stats.FT" },
            { text: "3PM", value: "stats.PM3" },
            { text: "Reb", value: "stats.Reb" },
            { text: "Ast", value: "stats.Ast" },
            { text: "TO", value: "stats.TO" },
            { text: "Stl", value: "stats.Stl" },
            { text: "Blk", value: "stats.Blk" },
        ],
    }),
    watch: {
        selectedDivision: function(){
            if (this.selectedDivision){ //0 is all
                this.data = jsonData.theData.filter(x => x.division === this.selectedDivision);
                this.statValueLocation = 'divisionValues';
                this.$set(this.headers, 3, {text: "Division Ranking", value: "divisionRank"});
                this.$set(this.headers, 4, {text: "Division Points", value: "divisionPoints"});
            } else {
                this.data = jsonData.theData;
                this.statValueLocation = 'statValues';
                this.$set(this.headers, 3, {text: "Overall Ranking", value: "overallRank"});
                this.$set(this.headers, 4, {text: "Total Points", value: "totalPoints"});
            }
        }
    },
    methods: {
        getColor(rank){
            let dataCount = this.data.length;

            if (rank/dataCount < .1) return 'red darken-4'
            else if (rank/dataCount < .25) return 'red darken-2'
            else if (rank/dataCount < .4) return 'red'
            else if (rank/dataCount < .55) return 'orange darken-1'
            else if (rank/dataCount < .7) return 'yellow darken-2'
            else if (rank/dataCount < .85) return 'green lighten-2'
            else return 'green'
        },
        getPromoColor(promoCode){
            if (promoCode == 'super') return 'blue'
            else if (promoCode == 'promotion') return 'green'
            else if (promoCode == 'relegation') return 'red'
            else return 'yellow darken-2'
        },
        getPromoText(promo){
            switch(promo){
                case 'super':
                    return 'Set for double promotion';
                case 'promotion':
                    return 'Set for promotion';
                case 'relegation':
                    return 'Set for relegation';
                default:
                    return 'Set to stay put';
            }
        }
    },
};
</script>

<style>
#app .v-data-table > .v-data-table__wrapper > table > tbody > tr > td, .v-data-table > .v-data-table__wrapper > table > tbody > tr > th, .v-data-table > .v-data-table__wrapper > table > thead > tr > td, .v-data-table > .v-data-table__wrapper > table > thead > tr > th, .v-data-table > .v-data-table__wrapper > table > tfoot > tr > td, .v-data-table > .v-data-table__wrapper > table > tfoot > tr > th {
    padding: 0 12px;
}

#app .v-data-table>.v-data-table__wrapper>table>tbody>tr>td, .v-data-table>.v-data-table__wrapper>table>tfoot>tr>td, .v-data-table>.v-data-table__wrapper>table>thead>tr>td {
    font-size: 0.8em;
}

.promoIcon {
    margin-right: 0.3em;
}
</style>