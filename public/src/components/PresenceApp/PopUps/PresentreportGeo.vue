<template>
  <div>
    <!-- eslint-disable -->
    <v-dialog
      :model-value="viewSwipeLocation"
      @update:model-value="viewSwipeLocation = $event"
      persistent
      max-width="1000"
      transition="dialog-bottom-transition"
    >
      <v-card>
        <v-toolbar elevation="0" dark density="compact" class="navBar">
          <v-toolbar-title class="ml-2">
            <div class="custom-title">
              Geo Location of {{ rowInfo.user_name }}
            </div>
          </v-toolbar-title>
          <v-spacer />
          <v-icon class="mr-3" @click="close_dialog()">mdi-close</v-icon>
        </v-toolbar>
        <v-card-text class="mt-4">
          <v-row>
            <v-col cols="6">
              <v-data-table
                :headers="headers"
                :height="height"
                :fixed-header="fixed"
                :items="newitem"
                :loading="tableLoading"
                density="compact"
                class="elevation-1 dtwidth"
                hide-default-footer
              >
                <template v-slot:[`item.swiped_time`]="{ item }">
                  <span v-text="get_date(item.swiped_time)"></span>
                </template>
                <template v-slot:[`item.swipe_source`]="{ item }">
                  <v-tooltip bottom>
                    <template v-slot:activator="{ on }">
                      <v-icon
                        small
                        v-on="on"
                        :color="
                          item.swipe_source == 'DATACORRECTION'
                            ? '#757575'
                            : item.swipe_source == 'PROXY'
                            ? '#757575'
                            : item.swipe_source == 'FACE'
                            ? '#757575'
                            : item.swipe_source == 'KIOSK'
                            ? '#757575'
                            : item.swipe_source == 'WHATSAPP'
                            ? '#757575'
                            : item.swipe_source == 'QR'
                            ? '#757575'
                            : item.swipe_source == 'RFID'
                            ? '#757575'
                            : ''
                        "
                        >{{
                          item.swipe_source == "DATACORRECTION"
                            ? "mdi-human-edit"
                            : item.swipe_source == "PROXY"
                            ? "mdi-odnoklassniki"
                            : item.swipe_source == "FACE"
                            ? "mdi-face-recognition"
                            : item.swipe_source == "KIOSK"
                            ? "mdi--alpha-k-circle-outline"
                            : item.swipe_source == "WHATSAPP"
                            ? "mdi-whatsapp"
                            : item.swipe_source == "QR"
                            ? "mdi-qrcode-scan"
                            : item.swipe_source == "RFID"
                            ? "mdi-credit-card-scan"
                            : ""
                        }}</v-icon
                      >
                    </template>
                    <span class="white--text">
                      {{
                        item.swipe_source == "DATACORRECTION"
                          ? "Source: Data Correction"
                          : item.swipe_source == "PROXY"
                          ? "Source: PROXY"
                          : item.swipe_source == "FACE"
                          ? "Source: FACE"
                          : item.swipe_source == "KIOSK"
                          ? "Source: Kiosk"
                          : item.swipe_source == "WHATSAPP"
                          ? "Source: WhatsApp"
                          : item.swipe_source == "QR"
                          ? "Source: QR"
                          : item.swipe_source == "RFID"
                          ? "Source: RFID"
                          : ""
                      }}
                    </span>
                  </v-tooltip>
                </template>
              </v-data-table>
            </v-col>
            <v-col cols="6">
              <GoogleMaps
                :center="markers[0] ? markers[0].position : center"
                :zoom="12"
                :markers="googleMarkers"
                :draggable="false"
                map-height="300px"
              />
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>
    </v-dialog>
  </div>
</template>
    <script>
import GoogleMaps from '@/components/GoogleMaps.vue';
export default {
  props: {
    viewSwipeLocation: Boolean,
    rowInfo: Object,
  },
  data() {
    return {
      center: { lat: 45.508, lng: -73.587 },
      markers: [],
      googleMarkers: [],
      places: [],
      currentPlace: null,
      newitem: [],
      headers: [
        {
          title: "Swiped Source",
          key: "swipe_source",
          sortable: false,
        },
        {
          title: "Swiped Location",
          key: "location_id",
          sortable: false,
        },
        {
          title: "Swiped Time",
          key: "swiped_time",
          sortable: false,
        },
      ],

      tableLoading: false,
      fixed: true,
      height: 0,
    };
  },
  watch: {
    viewSwipeLocation: {
      async handler() {
        if (this.viewSwipeLocation == true) {
          this.height = window.innerHeight - 340;

          this.newitem = this.rowInfo.swipe_list;

          this.markers = [];
          let baseImage = "https://maps.google.com/mapfiles/ms/icons/";
          let markerImage = [
            "red-dot.png",
            "yellow-dot.png",
            "green-dot.png",
            "blue-dot.png",
            "orange-dot.png",
            "purple-dot.png",
            "pink-dot.png",
          ];
          for (let i = 0; i < this.newitem.length; i++) {
            this.markers.push({
              position: {
                lat: Number(this.newitem[i].swipe_lat),
                lng: Number(this.newitem[i].swipe_long),
              },
              marker:
                baseImage +
                markerImage[Math.floor(Math.random() * markerImage.length)],
              title: this.newitem[i].location_id || `Marker ${i+1}`,
            });
          }
          // Map to GoogleMaps.vue expected format
          this.googleMarkers = this.markers.map(m => ({
            position: m.position,
            title: m.title
          }));
        }
      },
      immediate: true,
    },
  },
  methods: {
    get_date(date) {
      let a = new Date(date).toLocaleTimeString("en-In", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });
      return a.toUpperCase();
    },
    close_dialog() {
      this.$emit("clicked", 0);
    },
  },
  components: {
    GoogleMaps,
  },
};
</script>