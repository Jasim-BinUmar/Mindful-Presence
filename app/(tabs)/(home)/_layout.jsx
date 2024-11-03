import { View, Text, Image } from 'react-native'
import React from 'react'
import { Stack, Tabs, Redirect } from "expo-router";
import { icons } from "../../../constants";

const TabIcon = ({icon, color, name, focused})=> {
    return(
      <View className = "items-center justify-center gap-2 "  >
        <Image 
        source={icon}
        resizeMode="contain"
        tintColor={color}
        className = "w-6 h-6"
        />
        <Text className={`${focused ? 'font-psemibold' : 
        'font-pregular'}  text-xs`} style={{color:color}}>
          {name}
        </Text>
      </View>
    );
  
  }

const homeLayout = () => {
    return (
        < >
            <Tabs
                screenOptions={{
                    tabBarShowLabel: false,
                    tabBarActiveTintColor: "#FFA001",
                    tabBarInactiveTintColor: "#CDCDE0",
                    tabBarStyle: {
                        backgroundColor: "#161622",
                        borderTopWidth: 1,
                        borderTopColor: "#232533",

                        height: 80,   // Increase the height of the Tab Bar
                        paddingBottom: 10,  // Adjust padding to center icons
                        paddingTop: 10,  // Adjust padding at the top
                    },
                }}

            >
                {/* Home Tab */}
                <Tabs.Screen
                    name='home'
                    options={
                        {
                            title: "Home",
                            headerShown: false,
                            tabBarIcon: ({ color, focused }) => (
                                <TabIcon
                                    icon={icons.home}
                                    color={color}
                                    name={"home"}
                                    focused={focused}
                                />
                            )
                        }
                    }
                />

                {/* Pricing Tab */}

                <Tabs.Screen
                    name='/(payment)/pricing'
                    options={
                        {
                            title: "Pricing",
                            headerShown: false,
                            tabBarIcon: ({ color, focused }) => (
                                <TabIcon
                                    icon={icons.bookmark}
                                    color={color}
                                    name={"pricing"}
                                    focused={focused}
                                />
                            )
                        }
                    }
                />

               
            </Tabs>

        </>
    )
}

export default homeLayout