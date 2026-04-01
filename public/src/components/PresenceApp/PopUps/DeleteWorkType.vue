<template>
  <div>
    <v-dialog
      :model-value="WorkDelete"
      persistent
      max-width="400"
      transition="dialog-bottom-transition"
    >
      <v-card>
        <v-toolbar elevation="0" dark density="compact" class="bg-white">
          <v-spacer />
          <v-icon class="mr-3" @click="close_dialog()">mdi-close</v-icon>
        </v-toolbar>

        <v-card-title class="text-center">
          <div class="delete-icon-container">
            <v-img
              :src="trashIcon"
              alt="Delete Icon"
              max-width="120"
              height="120"
              contain
              class="rotate-swing"
            />
          </div>
        </v-card-title>

        <v-card-text v-if="deletedata" class="mt-4">
          <div class="text-center">
            Are you sure you want to delete the
            <strong>{{ deletedata.worktype_name }} Work-Type</strong> ?
          </div>
        </v-card-text>

        <v-card-actions class="justify-center">
          <v-btn
            depressed
            :loading="loading"
            @click="deleteCategory()"
            dark
            class="cardCss button-corner text-capitalize text-white"
          >
            Yes, Delete It!
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
/* eslint-disable */
import trashIcon from "@/assets/trash.png";
import {delete_worktype} from "@/graphql/mutations.js"
import { API, graphqlOperation } from "aws-amplify";
export default {
  props: {
    WorkDelete: Boolean,
    deletedata: {
       type: Object,
  
    
    },
  },
  data() {
    return {
      loading: false,
      trashIcon: trashIcon,
    };
  },
   computed: {
  worktpeDelete() {
    return this.deletedata?.worktype_id || "";
  
  },
},
  methods: {
    
    close_dialog() {
      this.$emit("close", 0);
    },
   

    async deleteCategory() {
      this.loading = true;
      try {
        let result = await API.graphql(
          graphqlOperation(delete_worktype, {
            input: {
           worktype_id : this.deletedata.worktype_id
            },
          })
        );
        var response = JSON.parse(result.data.delete_worktype);
        if (response.Status == "SUCCESS") {
          this.$emit("successMsg", response.Message);
        } else {
          this.$emit("errorMsg", response.Message);
        }
        this.loading = false;
        this.close_dialog();
      } catch (error) {
        this.loading = false;
        this.$emit("errorMsg", error.message || "An error occurred while deleting the category");
      }
    },
  },

};
</script>

<style scoped>
.rotate-swing {
  animation: swing 2s ease-in-out infinite;
}

@keyframes swing {
  0%,
  100% {
    transform: rotate(-3deg);
  }
  50% {
    transform: rotate(3deg);
  }
}

.cardCss {
  background: linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%) !important;
  border-radius: 25px !important;
  padding: 12px 24px !important;
  font-weight: 600 !important;
  box-shadow: 0 4px 15px rgba(255, 107, 107, 0.3) !important;
  transition: all 0.3s ease !important;
}

.cardCss:hover {
  transform: translateY(-2px) !important;
  box-shadow: 0 6px 20px rgba(255, 107, 107, 0.4) !important;
}

.button-corner {
  border-radius: 25px !important;
}

.delete-icon-container {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px 0;
  width: 100%;
}
</style>
