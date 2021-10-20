import Vue from 'vue';
import Vuetify from 'vuetify/lib/framework';

import colors from "vuetify/lib/util/colors";
//https://vuetifyjs.com/en/styles/colors/#material-colors

Vue.use(Vuetify);

export default new Vuetify({
    theme: {
        dark: window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches,
        themes: {
            light: {
                primary: colors.orange.darken2,
                secondary: colors.blue,
                accent: colors.shades.black,
                // error: colors.red.accent3,
            },
            dark: {
                primary: colors.orange.darken2,
                secondary: colors.blue,
            },
        },
    },
});
