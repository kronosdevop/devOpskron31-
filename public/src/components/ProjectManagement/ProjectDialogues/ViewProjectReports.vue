<template>
    <!-- eslint-disable -->
    <div>
        <v-dialog 
            :model-value="viewProjectReport" 
            @update:model-value="$emit('update:viewProjectReport', $event)"
            persistent 
            max-width="500" 
            transition="dialog-top-transition"
        >
            <v-card>
                <v-toolbar elevation="0" color="primary" density="compact" class="navBar">
                    <v-toolbar-title class="text-white">View Project Report</v-toolbar-title>
                    <v-spacer />
                    <v-icon class="icon-class" @click="close_dialog()">mdi-close</v-icon>
                </v-toolbar>
                <v-card-text>
                    <v-row>
                        <v-col cols="12">
                            <h3>Achieved Outcomes:</h3>
                            <p>{{ rowInfo.achieved_outcomes }}</p>
                        </v-col>
                        <v-col cols="12">
                            <h3>Planned Aspirations:</h3>
                            <p>{{ rowInfo.planned_aspirations }}</p>
                        </v-col>
                    </v-row>
                </v-card-text>
                <v-card-actions class="justify-end">
                    <v-btn color="primary" @click="close_dialog()">Close</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </div>
</template>

<script>
/* eslint-disable */
import { format_Date } from "@/JsonFiles/DateFormate.js";

export default {
    props: {
        rowInfo: Object,
        viewProjectReport: Boolean,
    },
    methods: {
        close_dialog() {
            this.$emit("clicked", 0);
        },
        fetch_value(val) {
            if (val == undefined) {
                return "-";
            } else {
                return format_Date(val);
            }
        },
        extract_name(email) {
            return email.split('@')[0]; // Extract the part before "@"
        },
    },
};
</script>
