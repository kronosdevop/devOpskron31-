<template>
  <v-container>
    <!-- Header Section -->
    <v-card class="pa-5" color="yellow lighten-4">
      <v-row align="center">
        <v-col cols="8">
          <h2 class="font-weight-bold red--text">LENORA Packers and Movers</h2>
          <p class="subtitle-1">
            G.F. C-108, DDUTTL, 2nd Stage, Yeshwanthpur, Bangalore - 560 022
          </p>
          <p class="subtitle-2">www.leopackersmoversbangalore.co.in</p>
          <p class="subtitle-2">E-mail: info@leopackersmoversbangalore.co.in</p>
        </v-col>
        <v-col cols="4" class="text-right">
          <p><strong>GST No:</strong> 29ABDPU5369A1ZG</p>
          <p>
            <strong>Mob:</strong>
            <span class="black--text font-weight-bold">9980304306</span>
          </p>
        </v-col>
      </v-row>
    </v-card>

    <!-- Quotation Details Section -->
    <v-card class="pa-5 mt-5">
      <v-row>
        <v-col cols="6">
          <v-text-field label="Mr./Mrs." dense outlined></v-text-field>
        </v-col>
        <v-col cols="6">
          <v-text-field label="Quotation No." dense outlined></v-text-field>
        </v-col>
        <v-col cols="6">
          <v-text-field label="Tel." dense outlined></v-text-field>
        </v-col>
        <v-col cols="6">
          <v-text-field label="Mobile" dense outlined></v-text-field>
        </v-col>
        <v-col cols="6">
          <v-text-field label="Date" dense outlined type="date"></v-text-field>
        </v-col>
        <v-col cols="6">
          <v-text-field label="From" dense outlined></v-text-field>
        </v-col>
        <v-col cols="6">
          <v-text-field label="To" dense outlined></v-text-field>
        </v-col>
      </v-row>
    </v-card>

    <!-- Customer Care -->
    <v-card class="pa-5 mt-3 red lighten-4 text-center">
      <h3 class="font-weight-bold">Customer Care No. 9632069498</h3>
    </v-card>

    <!-- Quotation Table -->
    <v-card class="pa-5 mt-3">
      <h3 class="red--text">SUB: QUOTATION FOR MOVER AND PACKER</h3>
      <p>Dear Sir/Madam,</p>
      <p>We thank you for your enquiry for shifting of your household goods.</p>

      <v-simple-table dense>
        <template #default>
          <thead>
            <tr>
              <th class="text-left">#</th>
              <th class="text-left">Description</th>
              <th class="text-left">Normal</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, index) in items" :key="index">
              <td>{{ index + 1 }}</td>
              <td>{{ item.description }}</td>
              <td>
                <v-text-field
                  v-model="item.price"
                  dense
                  outlined
                  prefix="Rs."
                ></v-text-field>
              </td>
            </tr>
          </tbody>
        </template>
      </v-simple-table>

      <h3 class="text-right mt-4">
        TOTAL: Rs. <span class="font-weight-bold">____</span>
      </h3>
    </v-card>

    <!-- Terms & Conditions -->
    <v-card class="pa-5 mt-3">
      <h3 class="red--text">TERMS & CONDITIONS</h3>
      <ul>
        <li>
          Packing will be done using the best packing materials (Lamination,
          Thermocol, Carton Box).
        </li>
      </ul>
    </v-card>

    <!-- Submit Button -->
    <v-btn color="primary" class="mt-3" block>Submit Quotation</v-btn>
  </v-container>
</template>
  
  <script>
export default {
  data() {
    return {
      items: [
        { description: "Transportation charges", price: "" },
        { description: "Packing charges", price: "" },
        { description: "Loading charges", price: "" },
        { description: "Unloading charges", price: "" },
        { description: "Unpacking charges", price: "" },
        {
          description:
            "Escort with vehicle inclusive of Escort's expenses & return fare",
          price: "",
        },
        { description: "Car transportation Charges", price: "" },
        {
          description: "Insurance Charges @3% on declaration value of goods",
          price: "",
        },
        { description: "St. Charges", price: "250" },
        { description: "GST 18%", price: "" },
        { description: "Octroi charges By party as per Actual", price: "" },
        { description: "Storage Charges", price: "" },
        { description: "Loading & Unloading Charges at warehouse", price: "" },
        { description: "Methodic kamgar Union Charges by party", price: "" },
      ],
    };
  },
};
</script>
  
  <style scoped>
h2,
h3 {
  text-transform: uppercase;
}
</style>
  