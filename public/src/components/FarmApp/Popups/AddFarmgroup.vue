<template>
  <div>
    <!-- eslint-disable -->

    <v-dialog :model-value="createGroupDialog" @update:model-value="$emit('update:createGroupDialog', $event)" persistent max-width="500" transition="dialog-top-transition">
      <v-card>
        <v-toolbar elevation="0" dark dense class="navBar">
          <v-toolbar-title class="text--black ml-2"
            ><div class="custom-title">
            Create Group
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
                  outlined
                  label="Group Name"
                  :rules="[(v) => !!v || 'required ']"
                  v-model="groupName"
                />
              </v-col>
              <v-col cols="12">
                <v-select
                  dense
                  v-model="groupHead"
                  label="Group Head"
                  :items="userList"
                  item-text="label"
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
import { get_all_users } from "@/mixins/GetAllUsers.js";
import SnackBar from "@/components/SnackBar.vue";
// import { create_expense_group } from "@/graphql/mutations.js";
// import { API, graphqlOperation } from "aws-amplify";
export default {
  props: {
    createGroupDialog: Boolean,
  },
  components: {
    SnackBar,
  },
  mixins: [get_all_users],
  data() {
    return {
      groupName: "",
      groupHead: "",
      userList: [],
      loading: false,
      SnackBarComponent: {},
    };
  },
  watch: {
    createGroupDialog: {
      async handler() {
        if (this.createGroupDialog == true) {
          await this.get_all_users();
          this.fetch_users();
        }
      },
      immediate: true,
    },
  },
  methods: {
    close_dialog() {
      this.$refs.form.resetValidation();
      this.$refs.form.reset();
      this.$emit("clicked", 0);
    },

    fetch_users() {
      this.listUsers.forEach((element) => {
        if (element.user_type != "CHATBOT") {
          this.userList.push({
            label: element.full_user_name,
            value: element.user_id,
          });
        }
      });
      this.userList.sort((a, b) => a.label.localeCompare(b.label));
    },

    validate_data() {
      if (this.$refs.form.validate()) {
        this.$emit("clicked", 0);
        // this.create_group();
      }
    },

    // async create_group() {
    //   this.loading = true;
    //   var data = this.$store.getters.GetUserObj;

    //   try {
    //     let result = await API.graphql(
    //       graphqlOperation(create_expense_group, {
    //         input: {
    //           organization_id: data.organization.organization_id,
    //           expense_group_name: this.groupName,
    //           user_email_id: data.user.user_email_id,
    //           expense_group_head: this.groupHead,
    //         },
    //       })
    //     );

    //     var response = JSON.parse(result.data.create_expense_group);
    //     this.loading = false;

    //     if (response.Status == "SUCCESS") {
    //       this.$emit("successMsg", response.Message);

    //       this.$refs.form.resetValidation();
    //       this.$refs.form.reset();
    //       this.$emit("addGroups", "recall");
    //     } else {
    //       this.$emit("errorMsg", response.Message);
    //     }
    //   } catch (error) {
    //     this.loading = false;

    //     this.$emit("errorMsg", error.errors[0].message);
    //   }
    // },
  },
};
</script>