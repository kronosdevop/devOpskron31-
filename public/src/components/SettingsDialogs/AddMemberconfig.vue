<template>
  <!-- eslint-disable -->
  <div>
    <v-dialog :model-value="addconfigMember" @update:model-value="$emit('update:addconfigMember', $event)" persistent max-width="500" transition="dialog-top-transition">
      <v-card>
        <v-toolbar elevation="0" dark dense class="navBar">
          <v-toolbar-title class="text--black ml-2"
            ><div class="custom-title">
            Create Membership
            </div></v-toolbar-title
          >
          <v-spacer />
          <v-icon class="icon-class" @click="close_dialog()">mdi-close</v-icon>
        </v-toolbar>
        <v-card-text>
          <v-form ref="form">
            <v-row no-gutters class="mt-4">
              <v-col cols="12">
                <v-text-field
                  dense
                  v-model="Membership"
                  label="Name"
                  :rules="[(v) => !!v || 'required ']"
                  outlined
                ></v-text-field>
              </v-col>
              <v-col cols="12">
                <v-textarea
                  label="Description"
                  v-model="Memberdescritiom"
                  outlined
                  :rules="[(v) => !!v || 'required ']"
                />
              </v-col>
              <v-col cols="12">
                <v-select
                  dense
                  v-model="valid_till"
                  label="Validity"
                  :items="validitems"
                  item-text="text"
                  item-value="value"
                  :rules="[(v) => !!v || 'required ']"
                  outlined
                ></v-select>
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>
        <v-card-actions class="justify-end">
          <v-btn
            dark
            @click="validate_data()"
            :loading="loading"
            class="text-capitalize cardCss button-corner"
            >Create</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>
  <script>
/* eslint-disable */
import { create_membership } from "@/graphql/mutations.js";
import { API, graphqlOperation } from "aws-amplify";

export default {
  props: {
    addconfigMember: Boolean,
  },

  data() {
    return {
      loading: false,
      Membership: "",
      valid_till: "",
      Memberdescritiom: "",
      validitems: [
        
          { text: "3 Months", value: "3M" },
          { text: "6 Months", value: "6M" },
          { text: "1 Year", value: "1Y" },
          { text: "2 Year", value: "2Y" },
          { text: "5 Year", value: "5Y" },
          { text: "10 Year", value: "10Y" },
        ],
      
    };
  },
  watch: {
    addconfigMember: {
      async handler() {
        if (this.addconfigMember == true) {
          this.valid_till = "";
        }
      },
      immediate: true,
    },
  },

  methods: {
    close_dialog() {
      this.$emit("clicked", 0);
    },
    validate_data() {
      if (this.$refs.form.validate()) {
        this.create_membership_deatils();
      }
    },
    async create_membership_deatils() {
      this.loading = true;
      var data = this.$store.getters.GetUserObj;
      try {
        let result = await API.graphql(
          graphqlOperation(create_membership, {
            input: {
              user_email_id: data.user.user_email_id,
              organization_id: data.organization.organization_id,
              membership_name: this.Membership,
              membership_description:this.Memberdescritiom,
              membership_validity: this.valid_till,
            },
          })
        );
        var response = JSON.parse(result.data.create_membership);
        this.loading = false;
        if (response.Status == "SUCCESS") {
          this.$emit("successMsg", response.Message);
          this.$refs.form.reset();
        } else {
          this.$emit("errorMsg", response.Message);
        }
      } catch (error) {
        this.$emit("errorMsg", error.errors[0].message);
        this.loading = false;
      }
    },
  },
};
</script>