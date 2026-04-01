<template>
  <!-- eslint-disable -->
  <div>
    <v-dialog
      :model-value="qrListLocation"
      @update:model-value="$emit('update:qrListLocation', $event)"
      persistent
      max-width="500"
    >
      <v-card>
        <v-toolbar elevation="0" dark density="compact" class="navBar">
          <v-toolbar-title class="text--white ml-2">
            <div class="custom-title">
              QR for {{ rowInfo.location_name }}
            </div></v-toolbar-title
          >
          <v-spacer />
          <v-icon class="icon-class mr-4" @click="close_dialog()"
            >mdi-close</v-icon
          >
        </v-toolbar>

        <v-card-text class="mt-8">
          <v-data-table
            :fixed-header="fixed"
            :headers="headers"
            :items="tableData"
            :loading="tableLoading"
            :footer-props="{
              itemsPerPageOptions: [10, 20],
            }"
            :items-per-page="10"
            density="compact"
            class="mt-n5 elevation-1 dtwidth"
          >
            <template v-slot:[`item.actions`]="{ item }">
              <v-icon size="small" color="primaryColor" @click="qrView(item)"
                >mdi-qrcode</v-icon
              >
            </template>
          </v-data-table>
        </v-card-text>
      </v-card>
    </v-dialog>
    <div v-if="componentCheck == 1">
      <LocationQRview
        :qrLocation="qrLocation"
        @clicked="qrLocation = false"
        :rowInfo="rowdata"
        :qrtype="qrtype"
      />
    </div>
  </div>
</template>
      <script>
import LocationQRview from "@/components/SettingsDialogs/LocationQRview.vue";
export default {
  components: {
    LocationQRview,
  },
  props: {
    qrListLocation: Boolean,
    rowInfo: Object,
  },
  data() {
    return {
      height: 0,
      componentCheck: 0,
      fixed: true,
      tableLoading: false,
      qrLocation: false,
      qrtype: "multiple",
      rowdata: {},
      tableData: [],
      headers: [
        { title: "Location", value: "qr_name", sortable: false },
        { title: "Action", value: "actions", sortable: false },
      ],
    };
  },
  watch: {
    qrListLocation: {
      async handler() {
        if (this.qrListLocation == true) {
          this.tableData = [];
          this.tableData = this.rowInfo.qr_details;

          //   this.height = window.innerHeight - 100;
        }
      },
      immediate: true,
    },
  },
  methods: {
    close_dialog() {
      this.$emit("clicked", 0);
    },

    qrView(item) {
      this.componentCheck = 1;
      this.rowdata = item;
      this.qrLocation = true;
    },
  },
};
</script>