<template>
  <div>
    <!-- eslint-disable -->
    <v-dialog :model-value="discussionAdd" @update:model-value="$emit('update:discussionAdd', $event)" persistent max-width="400" transition="dialog-top-transition">
      <v-card>
        <v-toolbar elevation="0" dark dense class="navBar">
          <v-toolbar-title class="text--black ml-2"
            ><div class="custom-title">
            Add Discussion Room
            </div></v-toolbar-title
          >
          <v-spacer />
          <v-icon class="icon-class" @click="close_dialog()">mdi-close</v-icon>
        </v-toolbar>
        <v-card-text class="mt-6">
          <v-form ref="form">
            <v-row no-gutters class="mt-4">
              <v-col cols="12">
                <v-text-field
                  dense
                  v-model="discussionname"
                  label="Discussion Name"
                  :rules="[(v) => !!v || 'Required ']"
                  outlined
                ></v-text-field>
              </v-col>
              <v-col cols="12">
                <v-textarea
                  outlined
                  dense
                  :rules="[(v) => !!v || 'Required']"
                  label="Description"
                  v-model="discussiondescription"
                />
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>
        <v-card-actions class="justify-end">
          <v-btn
            @click="validate_data()"
            :loading="loading"
            dark
            class="text-capitalize cardCss button-corner"
          >
            Add
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>
  <script>
/* eslint-disable */
import { create_teams } from "@/graphql/mutations.js";
import { API, graphqlOperation } from "aws-amplify";
export default {
  props: {
    discussionAdd: Boolean,
  },
  data() {
    return {
      loading: false,
      discussiondescription: "",
      discussionname: "",
    };
  },
  methods: {
    close_dialog() {
      // console.log(this.$store.getters.GetUserObj);
      this.$emit("clicked", 0);
    },
    validate_data() {
      if (this.$refs.form.validate()) {
        this.approval_actions();
      }
    },
    async approval_actions() {
      this.loading = true;
      var data = this.$store.getters.GetUserObj;
      try {
        let result = await API.graphql(
          graphqlOperation(create_teams, {
            input: {
              organization_id: data.organization.organization_id,
              team_name: this.discussionname,
              team_description: this.discussiondescription,
              team_owner_id: data.user.user_id,
              user_email_id: data.user.user_email_id,
            },
          })
        );
        var response = JSON.parse(result.data.create_teams);
        if (response.Status == "SUCCESS") {
          this.$emit("successMsg", response.Message);
          this.$refs.form.reset();
          this.$refs.form.resetValidation();
          this.loading = false;
        } else {
          this.$emit("errorMsg", response.Message);
          this.loading = false;
        }
      } catch (error) {
        this.loading = false;
        this.$emit("errorMsg", error.errors[0].message);
      }
    },
  },
};
</script>