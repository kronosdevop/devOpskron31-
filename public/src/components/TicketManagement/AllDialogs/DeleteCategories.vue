<template>
  <!-- eslint-disable -->
  <v-dialog :model-value="categorydelete" @update:model-value="$emit('update:categorydelete', $event)" persistent max-width="400" transition="dialog-top-transition">
    <v-card>
      <v-toolbar elevation="0" dark dense class="navBar">
        <v-toolbar-title class="text--black ml-2"
          ><div class="custom-title">Delete Categorie</div></v-toolbar-title
        >
        <v-spacer />
        <v-icon class="icon-class" @click="close_dialog()">mdi-close</v-icon>
      </v-toolbar>
      <v-card-title class="text-center">
          <v-img
            :src="require('@/assets/trash.png')"
            alt="Stichh Logo"
            max-width="800"
            height="150"
            contain
            class="rotate-swing"
          />
        </v-card-title>
      <v-card-text class="mt-4">
        <div class="text-left">
          Are you sure you want to delete
          <b> {{ categoryinfo.categorie_name }}</b> ?
        </div>
      </v-card-text>
      <v-card-actions class="justify-end">
        <v-btn
          depressed
          :loading="loading"
          @click="delete_mutation()"
          dark
          class="cardCss button-corner text-capitalize"
        >
          Yes
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
    
    <script>
import { edit_delete_categories_for_product } from "@/graphql/mutations.js";
import { API, graphqlOperation } from "aws-amplify";
export default {
  props: {
    categoryinfo: Object,
    categorydelete: Boolean,
  },
  data() {
    return {
      loading: false,
    };
  },
  watch: {
    categorydelete: {
      async handler() {
        if (this.categorydelete == true) {
          //  console.log( this.$store.getters.GetUserObj.user.user_email_id);
        }
      },
      immediate: true,
    },
  },
  methods: {
    close_dialog() {
      this.$emit("clicked", 0);
    },
    async delete_mutation() {
      this.loading = true;
      // var data = this.$store.getters.GetUserObj;
      try {
        let result = await API.graphql(
          graphqlOperation(edit_delete_categories_for_product, {
            input: {
              categorie_name: this.categoryinfo.categorie_name,
              categorie_id: this.categoryinfo.categorie_id,
            },
          })
        );
        var response = JSON.parse(
          result.data.edit_delete_categories_for_product
        );
        this.loading = false;
        if (response.Status == "SUCCESS") {
          this.$emit("successMsg", response.Message);
          // this.$refs.form.reset();
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
    
    <style>
</style>