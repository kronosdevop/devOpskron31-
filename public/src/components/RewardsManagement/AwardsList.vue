awards_and_recognition_workflow_configure<template>
  <v-card flat class="ma-2" >
    <v-row class="align-center px-6 pt-6 pb-2" >
      <v-col cols="auto" class="d-flex align-center">
        <v-icon class="mr-3" color="primary" size="large">mdi-trophy</v-icon>
        <span class="font-weight-bold text-h6">Awards</span>
      </v-col>
      <v-spacer />
      <v-col cols="auto" class="d-flex align-center">
        <v-text-field
          v-model="searchQuery"
          placeholder="Search awards..."
          prepend-inner-icon="mdi-magnify"
          variant="solo"
          hide-details
          density="compact"
          class="search-pill mr-4"
          style="min-width: 220px; max-width: 220px; height: 32px; border-radius: 999px; background: #fff; box-shadow: 0 1px 4px rgba(0,0,0,0.08); font-size: 14px;"
          clearable
          @click:clear="searchQuery = ''"
        ></v-text-field>
      </v-col>
    </v-row>
    <v-card-text class="pa-4">
      <v-data-table
        :headers="headers"
        :items="filteredItems"
        :items-per-page="10"
        class="elevation-2 dtwidth text-caption rounded-lg"
        density="compact"
        hover
      >
        <template v-slot:no-data>
          <div class="text-center py-8">
            <v-icon size="64" color="grey lighten-1" class="mb-4">mdi-trophy</v-icon>
            <div class="text-h6 grey--text mb-2">No Awards Found</div>
          </div>
        </template>
      </v-data-table>
    </v-card-text>
  </v-card>
</template>

<script>
import { API, graphqlOperation } from "aws-amplify";
import { manage_awards } from "@/graphql/mutations";

export default {
  data() {
    return {
      searchQuery: '',
      headers: [
        { title: 'Award Name', key: 'award_name' },
        { title: 'Recipient', key: 'recipient' },
        { title: 'Date', key: 'date' },
        { title: 'Given By', key: 'given_by' },
      ],
      items: [
       
      ],
    };
  },
  computed: {
    filteredItems() {
      if (!this.searchQuery) return this.items;
      const q = this.searchQuery.toLowerCase();
      return this.items.filter(item =>
        item.award_name.toLowerCase().includes(q) ||
        item.recipient.toLowerCase().includes(q) ||
        item.given_by.toLowerCase().includes(q)
      );
    },
  },
  async mounted() {
    await this.fetchAwards();
  },
  methods: {
    async fetchAwards() {
      try {
        const input = {
          action_type: 'LIST_ALL_AWARDS',
        };
        const result = await API.graphql(
          graphqlOperation(manage_awards, { input })
        );
        let response = JSON.parse(result.data.manage_awards);
        if(response.Status=='SUCCESS'){
          this.items = response.data.awards || [];
        }
        else{
          this.items = [];
        }
       
        // Do not process or bind the data yet
      } catch (error) {
        console.error('Failed to fetch awards:', error);
      }
    },
  },
};
</script>

<style scoped>
.search-pill :deep(.v-field__input) {
  padding-top: 0;
  padding-bottom: 0;
  min-height: 32px;
}
.search-pill :deep(.v-field__prepend-inner) {
  padding-inline-start: 12px;
}
.dtwidth {
  border-radius: 8px;
  overflow: hidden;
}
</style> 