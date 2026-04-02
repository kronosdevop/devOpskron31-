<template>
    <div >
        <div class="background">
            <img :src="microsoft" alt="" style="width: 100%;height:100%" >
        </div>
        <div class="d-flex align-item justify-center login-card">  
            <v-card elevation="15" height="300" width="450">
             <v-card-title>
                <span><img :src="microsoftlogo" alt="" width="130"></span>
             </v-card-title>
             <h3 class="ml-7">Sign in</h3>

             <v-card-text>
                <v-text-field
                v-model="email"
                placeholder="Email, phone, or Skype"
                class="font text-field"
                variant="underlined"
                style="width: 400px;"
                />
             </v-card-text>

             <v-card-actions class="d-flex justify-end align-end">
                <v-btn color="#0067B9" width="100" class="mr-6" density="compact"    @click="loginWithMicrosoft" variant="flat" >Next</v-btn>
             </v-card-actions>
            </v-card>
        </div>
    </div>
</template>

<script>
import microsoft from "@/assets/Microsoftlogin.png";
import microsoftlogo from "@/assets/microsoftlogo.png";

export default {
  data() {
    return {
      microsoft,
      microsoftlogo,
      email: "",
      loading1: false
    };
  },

  mounted() {
    // Pre-fill email if passed from redirect
    const params = new URLSearchParams(window.location.search);
    const emailFromQuery = params.get("email");

    if (emailFromQuery) {
      this.email = emailFromQuery;
    }
  },

  methods: {
    async loginWithMicrosoft() {
      if (!this.email) return;

      if (!this.loading1) {
        this.loading1 = true;

        try {
          const apiUrl =
            "https://1o5j55jzc9.execute-api.us-east-1.amazonaws.com/auth/microsoft";

          // Redirect to backend which handles Microsoft login
          window.location.href =
            `${apiUrl}?email=${encodeURIComponent(this.email)}`;

        } catch (error) {
          console.error("Error during Microsoft sign-in:", error);
        } finally {
          this.loading1 = false;
        }
      }
    }
  }
};
</script>

<style scoped>
h3{
font-family: "Segoe UI", SegoeUI, "Helvetica Neue", Helvetica, Arial, sans-serif;
font-weight: 600;
font-size: 24px;
margin-top: -7%;
margin-left: 10%;

}
.login-card{
    margin-top: -60%;
}
.font{
    font-family: "Segoe UI", SegoeUI, "Helvetica Neue", Helvetica, Arial, sans-serif;
    margin-left: 10%;

}
.text-field{
    border-top: none;
    background-color: white;
    margin-top: -4%;
    margin-left: 3%;
}
</style>