import { View, Text, ScrollView, StatusBar, TouchableOpacity, Dimensions } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import React, { useMemo } from 'react'
import { router } from 'expo-router'
import { BookOpen, Heart, Shield, Star, Zap, Info } from 'lucide-react-native'
import StandardHeader from '../../../components/StandardHeader'

const { width } = Dimensions.get('window');

const FullGuide = () => {
    // A curated list of daily wisdoms
    const wisdoms = useMemo(() => [
        { text: "And seek help through patience and prayer..." },
        { text: "Verily, in the remembrance of Allah do hearts find rest." },
        { text: "Allah does not burden a soul beyond that it can bear." },
        { text: "So verily, with every difficulty, there is relief." },
        { text: "Be patient with a beautiful patience." },
        { text: "Call upon Me; I will respond to you." }
    ], []);

    // Logic to pick a wisdom based on the day of the year
    const dailyWisdom = useMemo(() => {
        const now = new Date();
        const start = new Date(now.getFullYear(), 0, 0);
        const diff = now - start;
        const oneDay = 1000 * 60 * 60 * 24;
        const dayOfYear = Math.floor(diff / oneDay);
        return wisdoms[dayOfYear % wisdoms.length];
    }, [wisdoms]);

    const toolkitItems = [
        { id: 'dhikr', title: 'Daily Dhikr', icon: <Heart size={24} color="#623AD9" />, color: 'bg-pink-50', description: 'Spiritual remembrance and tranquility.' },
        { id: 'breath', title: 'Breath Work', icon: <Zap size={24} color="#623AD9" />, color: 'bg-blue-50', description: 'Physiological calm and focus.' },
        { id: 'reflect', title: 'Reflection', icon: <BookOpen size={24} color="#623AD9" />, color: 'bg-purple-50', description: 'Developing deep self-awareness.' },
        { id: 'safety', title: 'Safety Tools', icon: <Shield size={24} color="#623AD9" />, color: 'bg-green-50', description: 'Support for difficult moments.' },
    ];



    return (
        <SafeAreaView className='h-full bg-white'>
            <StatusBar backgroundColor="#161622" style="light" />
            <StandardHeader title="Full Guide" centeredTitle={true} />
            <ScrollView className="flex-1 h-full" showsVerticalScrollIndicator={false}>
                <View className="flex-1 pb-10">
                    {/* Wisdom Section Subtitle */}
                    <View className="mt-4 mb-4 px-6">
                        <Text className="text-gray-500 text-base">Your companion for inner peace and presence.</Text>
                    </View>

                    {/* Daily Wisdom Card - Automated Daily Change */}
                    <View className="mx-6 mb-8 bg-primary rounded-3xl p-6 shadow-lg shadow-primary/20">
                        <View className="flex-row items-center mb-3">
                            <Star size={20} color="white" fill="white" />
                            <Text className="text-white font-bold ml-2 uppercase tracking-widest text-xs">Wisdom of the Day</Text>
                        </View>
                        <Text className="text-white text-xl font-semibold italic leading-8">
                            "{dailyWisdom.text}"
                        </Text>
                    </View>

                    {/* How the App Works Section */}
                    <View className="mx-6 mb-8 bg-gray-50 rounded-3xl p-6 border border-gray-100">
                        <View className="flex-row items-center mb-4">
                            <Info size={20} color="#623AD9" />
                            <Text className="text-gray-900 font-bold ml-2 text-lg">App Navigation</Text>
                        </View>
                        <Text className="text-gray-600 leading-6 mb-4">
                            Everything in this app is tailored to your unique psychological profile. Complete your assessments to unlock personalized course recommendations.
                        </Text>
                        <TouchableOpacity
                            onPress={() => router.push('/(screens)/(selfAssesment)/AssessmentStart')}
                            className="bg-white border border-primary/20 py-3 rounded-2xl items-center"
                        >
                            <Text className="text-primary font-bold">Go to Assessments</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Mindfulness Toolkit - Main Content */}
                    <View className="px-6">
                        <Text className="text-xl font-bold text-gray-800 mb-4">Mindfulness Toolkit</Text>
                        <View className="flex-row flex-wrap justify-between">
                            {toolkitItems.map(item => (
                                <View
                                    key={item.id}
                                    className={`${item.color} w-full mb-4 p-5 rounded-3xl border border-gray-100 flex-row items-center`}
                                >
                                    <View className="bg-white p-3 rounded-2xl shadow-sm mr-4">
                                        {item.icon}
                                    </View>
                                    <View className="flex-1">
                                        <Text className="text-gray-800 font-bold text-base">{item.title}</Text>
                                        <Text className="text-gray-500 text-xs mt-1">{item.description}</Text>
                                    </View>
                                </View>
                            ))}
                        </View>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    )
}

export default FullGuide