<template>
  <div>
    <v-card  flat>
      <v-toolbar  flat dense>
        <v-toolbar-title>
          {{ $store.getters.GetcustomerData.legal_name }}
        </v-toolbar-title>
        <v-spacer />
        <v-btn dark class="text-capitalize cardCss ml-1" @click="back_call()">
          <v-icon class="mr-2">mdi-step-backward</v-icon>
          Back
        </v-btn>
      </v-toolbar>
      <v-card-text>
        <v-expansion-panels>
          <v-expansion-panel>
            <v-expansion-panel-header>
              Upcoming Payment Due Date Reminder
            </v-expansion-panel-header>
            <v-expansion-panel-content>
              <v-tabs v-model="upcomingTab" grow>
                <v-tab> Mail Trigger </v-tab>
                <v-tab> Template </v-tab>
              </v-tabs>
              <v-tabs-items v-model="upcomingTab">
                <v-tab-item>
                  <v-card  flat>
                    <MailTrigger triggertype="Upcoming" />
                  </v-card>
                </v-tab-item>

                <v-tab-item>
                  <v-card  flat>
                    <UpcomingTemplate />
                  </v-card>
                </v-tab-item>
              </v-tabs-items>
            </v-expansion-panel-content>
          </v-expansion-panel>
          <v-expansion-panel>
            <v-expansion-panel-header>
              Overdue Reminder
            </v-expansion-panel-header>
            <v-expansion-panel-content>
              <v-tabs v-model="overdueTab" grow>
                <v-tab> Mail Trigger </v-tab>
                <v-tab> Template </v-tab>
              </v-tabs>
              <v-tabs-items v-model="overdueTab">
                <v-tab-item>
                  <v-card  flat
                    ><MailTrigger triggertype="overdue" />
                  </v-card>
                </v-tab-item>

                <v-tab-item>
                  <v-card  flat
                    ><OverDueTemplate />
                  </v-card>
                </v-tab-item>
              </v-tabs-items>
            </v-expansion-panel-content>
          </v-expansion-panel>
        </v-expansion-panels>
      </v-card-text>
    </v-card>
  </div>
</template>

<script>
import UpcomingTemplate from "@/components/ARAP/UpcomingTemplate.vue";
import OverDueTemplate from "@/components/ARAP/OverDueTemplate.vue";
import MailTrigger from "@/components/ARAP/MailTrigger.vue";
export default {
  components: {
    MailTrigger,
    OverDueTemplate,
    UpcomingTemplate,
  },
  data() {
    return {
      overdueTab: 0,
      upcomingTab: 0,
    };
  },
  methods: {
    back_call() {
      this.$router.push("/Arap");
    },
  },
};
</script>