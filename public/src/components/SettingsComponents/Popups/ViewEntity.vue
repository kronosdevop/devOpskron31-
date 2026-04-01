<template>
  <div>
    <!-- eslint-disable -->
    <v-dialog
      :model-value="viewEntityDialog"
      @update:model-value="$emit('update:viewEntityDialog', $event)"
      persistent
      max-width="500"
      transition="dialog-top-transition"
    >
      <v-card>
        <v-toolbar elevation="0" dark density="compact" class="navBar">
          <v-toolbar-title class="text--black">
            <div class="custom-title">View Entity</div>
          </v-toolbar-title>
          <v-spacer />
          <v-icon class="icon-class mr-4" @click="close_dialog()"
            >mdi-close</v-icon
          >
        </v-toolbar>
        <v-card-text class="">
          <v-row>
            <v-col cols="12">
              <p>
                Entity Name: <b>{{ ViewEntityInfo.entity_name || "N/A" }}</b>
              </p>
              <p>
                Entity Contact Number:
                <b
                  >{{
                    ViewEntityInfo?.owner_country_code &&
                    ViewEntityInfo?.owner_contact_no
                      ? ViewEntityInfo.owner_country_code +
                        "-" +
                        ViewEntityInfo.owner_contact_no
                      : "N/A"
                  }}
                </b>
              </p>
              <p>
                Entity Address:
                <b>{{ ViewEntityInfo.entity_address || "N/A" }}</b>
              </p>
              <p>
                Tax ID: <b>{{ ViewEntityInfo.entity_gst || "N/A" }}</b>
              </p>
              <p>
                Entity Owner Name:
                <b>{{ ViewEntityInfo.entity_owner_name || "N/A" }}</b>
              </p>
              <p>
                Entity UPI Id:
                <b>{{ ViewEntityInfo.entity_upi_id || "N/A" }}</b>
              </p>
            </v-col>
          </v-row>
          <v-row class="mt-n4">
            <v-col
              cols="12"
              sm="6"
              v-if="
                ViewEntityInfo?.entity_logo &&
                !ViewEntityInfo.entity_logo.includes('/N/A')
              "
            >
              <p>
                Entity Logo:
                <v-img
                  :src="ViewEntityInfo.entity_logo"
                  class="preview"
                ></v-img>
              </p>
            </v-col>
            <v-col cols="12" sm="6" v-if="ViewEntityInfo?.entity_signature">
              <p>
                Entity Signature:
                <v-img
                  :src="ViewEntityInfo.entity_signature"
                  class="preview"
                ></v-img>
              </p>
            </v-col>
          </v-row>
          <v-row class="">
            <v-col cols="12" sm="6" v-if="ViewEntityInfo?.entity_seal">
              <p>
                Entity Seal:
                <v-img
                  :src="ViewEntityInfo.entity_seal"
                  class="preview"
                ></v-img>
              </p>
            </v-col>
            <v-col cols="12" sm="6" v-if="ViewEntityInfo?.entity_qr_code">
              <p>
                Entity QRCode:
                <v-img
                  :src="ViewEntityInfo.entity_qr_code"
                  class="preview"
                ></v-img>
              </p>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
/* eslint-disable */
export default {
  props: {
    viewEntityDialog: Boolean,
    ViewEntityInfo: Object,
  },
  data() {
    return {};
  },

  methods: {
    close_dialog() {
      this.$emit("clicked", 0);
    },
  },
};
</script>

<style scoped>
.preview {
  width: 150px;
  height: 80px;
  object-fit: contain;
  border-radius: 5px;
  margin-bottom: 10px;
}
.delete-icon {
  cursor: pointer;
  color: red;
  margin-left: -8px;
  margin-top: 30px;
}
.logo-header {
  font-weight: bold;
  font-size: 14px;
  margin-bottom: 5px;
  display: block;
}
</style>
