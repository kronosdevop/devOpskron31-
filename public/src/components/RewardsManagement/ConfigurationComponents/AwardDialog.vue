<template>
<v-dialog :model-value="recentAward" persistent width="680">
  <v-card class="award-card">

    <!-- HEADER -->
    <v-card-title class="d-flex align-center award-title-bar">
      <winnerTrophy size="40" class="mr-2 trophy-icon" />
      <span class="title-text">Recent Award --        {{ items?.winner_name }}
</span>

      <v-spacer></v-spacer>

      <div class="winner-name">
        <v-icon  @click="closeDialog" color="red">mdi-close</v-icon>
      </div>
    </v-card-title>

    <v-divider></v-divider>

    <!-- CONTENT -->
    <v-card-text class="pt-6 pb-2">
      <div class="award-box">

        <div class="award-row">

          <!-- AVATAR + BADGE -->
<div class="avatar">

  <!-- LOADER -->
  <div v-if="!imageLoaded" class="avatar-loader">
    <v-progress-circular
      indeterminate
      size="30"
      width="3"
      color="primary"
    />
  </div>

  <!-- IMAGE -->
  <img
    v-if="userImage"
    :src="userImage"
    @load="imageLoaded = true"
    @error="imageLoaded = true"
    v-show="imageLoaded"
  />

  <!-- FALLBACK -->
  <div v-if="!userImage && imageLoaded" class="fallback">
    {{ items?.winner_name?.charAt(0) }}
  </div>

</div>  <!-- CONTENT -->
          <div class="content">
            <div class="award-title">
              {{ items?.recent_awards?.[0]?.award_title }}
            </div>
<div class="award-date">
  {{ formatDate(items?.recent_awards?.[0]?.award_date) }}
</div>
            <div class="award-desc">
              {{ items?.recent_awards?.[0]?.award_reason }}
            </div>
          </div>

        </div>

      </div>
    </v-card-text>

    <!-- ACTION -->
    <v-card-actions class="justify-center pb-6 pt-2">
   
    </v-card-actions>

  </v-card>
</v-dialog>
</template>

<script>
import winnerTrophy from "@/components/RewardsManagement/ConfigurationComponents/winnerTrophy.vue";
import {get_all_org_users} from "@/mixins/GetUsersDropdown.js"
export default {
  components: {
    winnerTrophy,
  },
  mixins: [get_all_org_users],
  props: {
    recentAward: Boolean,
    items: Object,
  },
  data() {
  return {
    imageLoaded: false,
  };
},
watch: {
  userImage() {
    this.imageLoaded = false;
  }
},
computed: {
  userImage(){
    if(!this.items || !this.orgUsers.length) return null;
    const user = this.orgUsers.find(
        u => u.user_id === this.items.winner_user_id
    );
    return user.user_profile_pic_url !== "N/A" ? user.user_profile_pic_url : null;
  }
},

mounted(){
this.get_all_org_users();
},
  methods: {
    closeDialog() {
      this.$emit("close", 0);
    },
   formatDate(date) {
  if (!date) return "";

  const d = new Date(date);

  return d.toLocaleDateString("en-GB", {
    day: "numeric",     
    month: "long",     
    year: "numeric"   
  });
}
  },
};
</script>

<style scoped>
/* Card */
.award-card {
  border-radius: 22px;
  overflow: hidden;
  backdrop-filter: blur(10px);
}

/* Header */
.award-title-bar {
  font-weight: 700;
  font-size: 18px;
  color: #0f172a;
  padding: 18px 22px;
}

.trophy-icon {
  color: #ec4899;
}

.title-text {
  font-weight: 700;
}

.winner-name {
  font-size: 14px;
  font-weight: 600;
  color: #64748b;
}

/* Award Box */
.award-box {
  width: 100%;
  border-radius: 20px;
  padding: 24px;
  background: linear-gradient(135deg, #fdf2f8, #eef2ff);
                  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.08);
}

/* Layout */
.award-row {
  display: flex;
  gap: 22px;
  align-items: flex-start;
}

/* Avatar Wrapper */
.avatar-wrapper {
  position: relative;
}

/* Avatar */
.avatar {
  width: 110px;
  height: 110px;
  border-radius: 18px;
  overflow: hidden;
  background: #e2e8f0;
  border: 3px solid white;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
}

/* Image */
.avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* Fallback */
.fallback {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 34px;
  font-weight: 700;
  color: #475569;
}

/* 🔥 Winner Badge */
.winner-badge {
  position: absolute;
  bottom: -8px;
  left: 50%;
  transform: translateX(-50%);
  background: linear-gradient(135deg, #f59e0b, #f43f5e);
  color: white;
  font-size: 11px;
  font-weight: 700;
  padding: 4px 10px;
  border-radius: 999px;
  box-shadow: 0 6px 14px rgba(0, 0, 0, 0.2);
}

/* Content */
.content {
  flex: 1;
}

/* Title */
.award-title {
  font-size: 22px;
  font-weight: 800;
  color: #ec4899;
}

/* Date */
.award-date {
  font-size: 13px;
  color: #64748b;
  margin-top: 6px;
}

/* Description */
.award-desc {
  font-size: 14.5px;
  color: #1e293b;
  margin-top: 14px;
  line-height: 1.7;
}

/* Button */
.close-btn {
  background: linear-gradient(135deg, #ec4899, #f43f5e);
  color: white;
  border-radius: 12px;
  padding: 10px 32px;
  font-weight: 600;
  letter-spacing: 0.5px;
  transition: 0.3s ease;
}

.close-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(236, 72, 153, 0.4);
}
/* 🎖️ Clean Modern Medal */
.medal {
  position: absolute;
  top: -8px;
  right: -8px;

  width: 34px;
  height: 34px;
  border-radius: 50%;

  display: flex;
  align-items: center;
  justify-content: center;

  background: linear-gradient(135deg, #fbbf24, #f59e0b); /* soft gold */

  color: white;

  border: 2px solid white;

  box-shadow: 0 4px 10px rgba(0,0,0,0.15);

  z-index: 3;
}

/* Icon size fix */
.medal .v-icon {
  font-size: 16px;
}

/* Smooth hover effect */
.avatar-wrapper:hover .medal {
  transform: scale(1.08);
  transition: all 0.25s ease;
}
.avatar-loader {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f1f5f9;
}
</style>