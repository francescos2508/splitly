/* import { Text, View } from "react-native";

export default function Index() {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Text>Edit app/index.tsx to edit this screen.</Text>
    </View>
  );
}
 */

import { supabase } from "@/src/lib/supabase";
import { View, Text } from "react-native";

export default function Index() {

  console.log(supabase);

  return (
    <View>
      <Text>Splitly</Text>
    </View>
  );
}