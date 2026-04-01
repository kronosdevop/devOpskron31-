<template>
  <div>
    <v-toolbar flat>
      <!-- <v-toolbar-title>Select AI</v-toolbar-title> -->

      <v-spacer />
      <v-btn dark class="text-capitalize cardCss" @click="create_form()">
        Add
      </v-btn>
      <v-btn dark class="text-capitalize ml-2 cardCss" @click="back_call()">
        <v-icon class="mr-2">mdi-step-backward</v-icon>
        Back
      </v-btn>
    </v-toolbar>
    <v-card-text>
      <v-data-table
        :headers="headers"
        :items="tableData"
        :height="height"
        :loading="tableLoading"
        :footer-props="{
          itemsPerPageOptions: [10, 20, 30, 40, 50],
        }"
        dense
        :options.sync="pagination"
        class="elevation-1 dtwidth"
      >
      </v-data-table>
    </v-card-text>
    <div v-if="componentCheck == 1">
      <CreateDialog :createPopup="createPopup" @clicked="createPopup = false" />
    </div>
  </div>
</template>
<script>
/* eslint-disable */

import CreateDialog from "@/components/SurveillanceApp/AllPopups/CreateDialog.vue";
export default {
  components: {
    CreateDialog,
  },
  data() {
    return {
      tableLoading: false,
      tableData: [],
      headers: [
        { text: " Name", value: "form_name", sortable: false },
        {
          text: " Description",
          value: "form_description",
          sortable: false,
        },
        { text: "Created by ", value: "is_form_designed", sortable: false },
      ],
      pagination: {
        itemsPerPage: 20,
        page: 1,
      },
      componentCheck: 0,
      createPopup: false,
    };
  },
  methods: {
    back_call() {
      this.$router.push("/UserlevelApp");
    },
    create_form() {
      this.componentCheck = 1;
      this.createPopup = true;
    },
  },
};
</script>