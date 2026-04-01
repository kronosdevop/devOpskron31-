<template>
  <v-card flat class="ma-2" >
    <v-row
      class="align-center px-6 pt-6 pb-2"
      
    >
      <v-col cols="auto" class="d-flex align-center">
        <v-icon class="mr-3" color="primary" size="large"
          >mdi-account-group</v-icon
        >
        <span class="font-weight-bold text-h6">Nominees</span>
      </v-col>
      <v-spacer />
      <v-col cols="auto" class="d-flex align-center">
        <v-text-field
          v-model="searchQuery"
          placeholder="Search nominees..."
          prepend-inner-icon="mdi-magnify"
          variant="solo"
          hide-details
          density="compact"
          class="search-pill mr-4"
          style="
            min-width: 220px;
            max-width: 220px;
            height: 32px;
            border-radius: 999px;
            background: #fff;
            box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
            font-size: 14px;
          "
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
        <template #item.nomination_count="{ item }">
          <span
            class="link"
            style="color: #1976d2; cursor: pointer; text-decoration: underline;"
            @click="openNominationsDialog(item)"
          >
            {{ item.nomination_count }}
          </span>
        </template>
        <template #no-data>
          <div class="text-center py-8">
            <v-icon size="64" color="grey lighten-1" class="mb-4"
              >mdi-account-group</v-icon
            >
            <div class="text-h6 grey--text mb-2">No Nominees Found</div>
          </div>
        </template>
      </v-data-table>
    </v-card-text>
  </v-card>
  <v-dialog v-model="showNominationsDialog" max-width="400">
    <v-card>
      <v-card-title>
        Nominated By for {{ selectedNomineeName }}
      </v-card-title>
      <v-card-text>
        <v-list>
          <v-list-item
            v-for="(nominator, idx) in selectedNominations"
            :key="idx"
          >
          
            <div>
              {{ nominator.nominated_by_name || nominator.nominator_email }}
            </div>
          </v-list-item>
          <v-list-item v-if="!selectedNominations.length">
            <div>No nominations found.</div>
          </v-list-item>
        </v-list>
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn text @click="showNominationsDialog = false">Close</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import { API, graphqlOperation } from "aws-amplify";
import { manage_awards } from "@/graphql/mutations";

export default {
  data() {
    return {
      searchQuery: "",
      headers: [
        { title: "Name", key: "nominee_name" },
        { title: "Email", key: "nominee_email_id" },
        { title: "Nominated By", key: "nomination_count" },
       
      ],
      items: [],
      showNominationsDialog: false,
      selectedNominations: [],
      selectedNomineeName: '',
    };
  },
  computed: {
    filteredItems() {
      if (!this.searchQuery) return this.items;
      const q = this.searchQuery.toLowerCase();
      return this.items.filter(
        (item) =>
          item.name?.toLowerCase().includes(q) ||
          item.email?.toLowerCase().includes(q) ||
          item.nominated_by?.toLowerCase().includes(q)
      );
    },
  },
  async mounted() {
    await this.fetchNominees();
  },
  methods: {
    async fetchNominees() {
      try {
        // You may need to adjust the input object as per your backend requirements
        const input = {
          action_type: "LIST_ALL_NOMINATIONS",
        };
        const result = await API.graphql(
          graphqlOperation(manage_awards, { input })
        );
        let response = JSON.parse(result.data.manage_awards);
        // console.log(response);
        if(response.Status=='SUCCESS'){
          this.items = response.data.nominees || [];
        }
        else{
          this.items = [];
        }
        // Adjust the path below if your API response structure is different
        
        
      } catch (error) {
        console.error("Failed to fetch nominees:", error);
      }
    },
    openNominationsDialog(item) {
      this.selectedNominations = item.nominations || [];
      this.selectedNomineeName = item.nominee_name || '';
      this.showNominationsDialog = true;
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