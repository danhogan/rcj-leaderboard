<template>
    <div>
        <v-container>
            <v-row align="center">
                <v-spacer></v-spacer>
                <v-col cols="2">
                    <v-select :items="leagueIds" v-model="selectedLeague" item-value="id" item-text="name" return-object></v-select>
                </v-col>
                <v-spacer></v-spacer>
                <v-col cols="2">
                    <v-select :items="statSelections" v-model="selectedStat" item-value="back" item-text="front" return-object></v-select>
                </v-col>
                <v-spacer></v-spacer>
                <v-col cols="3" style="margin-top: 2em">
                    <v-slider
                        :max="maxDaysBack"
                        min="1"
                        v-model="daysBack"
                        label="Days Back"
                    >
                        <template v-slot:append>
                            <v-text-field
                                v-model="daysBack"
                                class="mt-0 pt-0"
                                hide-details
                                single-line
                                type="number"
                                style="width: 40px"
                            ></v-text-field>
                        </template>
                    </v-slider>
                </v-col>
                <v-spacer></v-spacer>
            </v-row>
        </v-container>
        
        <apexchart ref="chartPlot" type="line" height="600" :options="chartOptions" :series="series" />
    </div>
</template>

<script>
import apexchart from "vue-apexcharts";
import _ from "lodash";
import data from "../allTheData.json";

export default {
    components: {
        apexchart,
    },
    data() {
        return {
            series: [],
            leagueIds: [
                { 
                    id: 28233,
                    name: "D1"
                },
                {
                    id: 28234,
                    name: "D2A"
                },
                {
                    id: 28250,
                    name: "D2B"
                },
                {
                    id: 28251,
                    name: "D3A"
                },
                { 
                    id: 28252,
                    name: "D3B"
                },
            ],
            selectedLeague: {id: 28233, name: "D1"},
            statSelections: [
                {
                    back: "Pts",
                    front: "Pts",
                },
                {
                    back: "FG",
                    front: "FG%",
                },
                {
                    back: "FT",
                    front: "FT%",
                },
                {
                    back: "PM3",
                    front: "3PM",
                },
                {
                    back: "Reb",
                    front: "Reb",
                },
                {
                    back: "Ast",
                    front: "Ast",
                },
                {
                    back: "TO",
                    front: "TO",
                },
                {
                    back: "Stl",
                    front: "Stl",
                },
                {
                    back: "Blk",
                    front: "Blk",
                },    
            ],
            selectedStat: {back: "Pts", front: "Pts"},
            daysBack: 365,
            maxDaysBack: 365,
            chartOptions: {
                chart: {
                    id: "chartPlot",
                    zoom: {
                        enabled: false,
                    },
                    type: "line",
                    events: {
                        markerClick(event, chartContext, goodStuff) {
                            console.log('goodStuff:', goodStuff)
                            let team = goodStuff.w.config.series[goodStuff.seriesIndex];
                            console.log('team:', team)
                            window.open(`https://www.fleaflicker.com/nba/leagues/${team.leagueId}/teams/${team.teamId}`, "_blank");
                        }
                    }
                },
                markers: {
                    size: 5
                },
                xaxis: {
                    title: {
                        text: "Day",
                    },
                    axisTicks: {
                        show: true,
                    },
                    tickAmount: 10,
                },
                yaxis: {
                    title: {
                        text: "Amount",
                    },
                    labels: {
                        formatter(val) {
                            return parseFloat(val).toFixed(2);
                        },
                    },
                },
                colors: [
                    '#3D44CA',
                    '#CA3D3D',
                    '#E0CF42',
                    '#59DB3F',
                    '#E5AF34',
                    '#AA50E1',
                    '#A07C35',
                    '#DF67D4',
                    '#a9ed87',
                    '#E5E5E5',
                    '#979797',
                    '#aaffc3',
                    '#5DC3C2',
                ],
                // tooltip: {
                //     custom(thisPoint) {
                //         return `<div class="arrow_box">
                //             <span>${thisPoint.w.config.series[thisPoint.seriesIndex].data[thisPoint.dataPointIndex].name}</span>
                //             <span>${thisPoint.series[thisPoint.seriesIndex][thisPoint.dataPointIndex]}</span>
                //             </div>`;
                //     },
                // },
            },
        }
    },
    watch: {
        selectedLeague(){
            this.series = this.byLeague;
        },
        selectedStat(){
            this.series = this.byLeague;
        },
        daysBack(){
            this.series = this.byLeague;
        }
    },
    computed: {
        byLeague(){
            return data.theData.filter(d => d.leagueId == this.selectedLeague.id).map(team => {
                return {
                    name: team.teamName,
                    teamId: team.teamId,
                    leagueId: team.leagueId,
                    data: _.takeRight(team.statsHistory[this.selectedStat.back], this.daysBack)
                }
            });
        }
    },
    created() {
        this.series = this.byLeague;
        this.daysBack = this.maxDaysBack = this.series[0].data.length;
    },
}
</script>

<style lang="scss">
    #app .v-input__append-outer { 
        margin-top: 0;
    }
</style>