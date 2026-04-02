<template>
<v-dialog
  :model-value="dashboard_dialog"
  persistent
  transition="dialog-bottom-transition"
>

    <v-card class="app-dialog-card">

      <!-- Header -->
      <v-card-title class="dialog-header">
        <div class="header-left">
          <div class="icon-wrap">
            <v-icon size="26" color="white">
              {{ dashboard_data.icon }}
            </v-icon>
          </div>

          <div class="title-group">
            <div class="title-text">{{ dashboard_data.text }}</div>
            <div class="subtitle-text">Application details</div>
          </div>
        </div>

        <v-btn icon variant="text" @click="$emit('close')">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>

      <!-- Body -->
      <v-card-text class="dialog-body">

        <!-- Description -->
        <div class="section">
          <div class="description-box">
            {{ dashboard_data.description || 'No description available.' }}
          </div>
        </div>

        <v-divider class="my-4" />

        <!-- Non-owner message -->
       <div
  v-if="$store.getters.GetUserObj.user.user_type !== 'OWNER'"
  class="admin-note"
>
  <v-icon size="16" class="mr-1">mdi-information</v-icon>
 <p> Please contact your Solution Admin <strong>({{ownerName}} - {{ owneremail }})</strong> to enable this app.</p> 
</div>
        <!-- Owner action -->
        <div v-else class="action-footer">
          <v-btn
            color="primary"
            class="deploy-btn"
            elevation="2"
            rounded
            @click="admin_deployed_app"
          >
            <v-icon start>mdi-rocket-launch</v-icon>
            Deploy App
          </v-btn>
        </div>

      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script>
import { edit_or_delete_dashboard_topic } from "@/graphql/mutations.js";
import { API, graphqlOperation } from "aws-amplify";

export default {
  emits: ["close"],
  props: {
    dashboard_dialog: {
      type: Boolean,
      required: true,
    },
    dashboard_data: {
      type: Object,
    },
    owneremail:{
      type:String,
    },
    ownerName:{
      type:String,
    }
  },
  data(){
    return{
      deloyedSuccess: false,
      deploying:false,
    }
  },
  watch: {
  dashboard_dialog(val) {
    if (val) {
      this.deployedSuccess = false;
      this.deploying = false;
    }
  }
},


  computed: {
    canDeploy() {
      return this.dashboard_data?.access === 'ADMIN_ONLY'
    },
    ownerEmail() {
    const org = this.$store.getters.GetOrgDetails?.organization;

    // adjust key name if your backend uses a different one
    return (
      org?.owner_email_id ||
      org?.organization_owner_email ||
      "the system administrator"
    );
  }
  },

  methods: {
    async admin_deployed_app() {
  this.deploying = true;

  const data = this.$store.getters.GetUserObj;

  try {
    const result = await API.graphql(
      graphqlOperation(edit_or_delete_dashboard_topic, {
        input: {
          action_type: "EDIT",
          dashboard_id: this.dashboard_data.id,
          organization_id: data.organization.organization_id,
          is_visible: true,
          app_enabled: "YES",
          user_email_id: data.user.user_email_id,        }
      })
    );

    const response = JSON.parse(
      result.data.edit_or_delete_dashboard_topic
    );

    if (response.Status === "SUCCESS") {
      this.deployedSuccess = true;

      this.$emit("successMsg", {
        appName: this.dashboard_data.text,  
        message: `${this.dashboard_data.text} has been deployed successfully`,
        appId: this.dashboard_data.id,
        newStatus: true,
        timeout: 5000
      });
    } else {
      this.$emit("errorMsg", response.Message);
    }
  } catch (error) {
    this.$emit("errorMsg", error.errors?.[0]?.message || "Deployment failed");
  } finally {
    this.deploying = false;
  }
}

  }
}
</script>

<style scoped>
.app-dialog-card {
  width: 100%;
  height: 100%;

  display: flex;
  flex-direction: column;

  border-radius: 0px; /* perfect square */
  overflow: hidden;

  box-shadow:
    0 12px 30px rgba(0, 0, 0, 0.15),
    0 4px 10px rgba(0, 0, 0, 0.1);

  animation: dialogPop 0.25s ease-out;
}

:deep(.v-overlay__content) {
  width: 600px !important;
  height: 350px !important;
  max-width: 800px !important;
  max-height: 800px !important;

  display: flex;
  align-items: center;
  justify-content: center;
}

@keyframes dialogPop {
  from {
    opacity: 0;
    transform: scale(0.96) translateY(10px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.dialog-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 18px 20px;

  border-bottom: 1px solid #e5e7eb;
}


.header-left {
  display: flex;
  align-items: center;
  gap: 14px;
}

.icon-wrap {
  width: 44px;
  height: 44px;
  border-radius: 14px;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  display: flex;
  align-items: center;
  justify-content: center;
}

.title-group {
  display: flex;
  flex-direction: column;
}

.title-text {
  font-size: 17px;
  font-weight: 600;
  line-height: 1.2;
}

.subtitle-text {
  font-size: 12px;
  color: #6b7280;
}
.dialog-body {
  padding: 20px;
  flex: 1;        
  overflow: hidden;
}


.section {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.section-label {
  font-size: 13px;
  font-weight: 600;
  color: #374151;
}

.description-box {
  background: #f9fafb;
  border-radius: 8px;
  padding: 14px;
  margin-top: 3%;
  font-size: 14px;
  color: #374151;
  line-height: 1.6;

  max-height: 180px;  
  overflow-y: auto;    
}


.admin-note {
margin-top: 9%;
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #2563eb;
  background: #eff6ff;
  padding: 12px 14px;
  border-radius: 12px;
}

.action-footer {
  display: flex;
  justify-content: flex-end;
}
.deploy-btn {
  margin-top: 9%;
  margin-right: 32%;
 width: 40%;
  text-transform: none;
  font-weight: 600;

  /* Solid base shadow */
  box-shadow:
    0 6px 16px rgba(233, 28, 131, 0.35),
    0 2px 89px rgba(233, 28, 131, 0.35);

  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
}

:deep(.deploy-btn.v-btn) {
  margin-top: 7.5%;
  margin-right: 32%;

  text-transform: none;
  font-weight: 600;

  overflow: visible !important; /* 🔥 CRITICAL */

  box-shadow:
    0 8px 20px rgba(236, 72, 153, 0.45),
    0 4px 10px rgba(0, 0, 0, 0.2) !important;

  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
} 



</style>
