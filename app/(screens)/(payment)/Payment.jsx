import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CreditCard, Calendar, BookOpen } from 'lucide-react-native';
import StandardHeader from '../../../components/StandardHeader';
import { api } from '../../../services/api';
import { useGlobalContext } from '../../../lib/globalContext';
import { format } from 'date-fns';

const payment = () => {
  const { user } = useGlobalContext();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchPaymentHistory = async () => {
    try {
      setLoading(true);
      const response = await api.payments.getPaymentHistory();
      if (response.success) {
        // Map from the new centralized Payment model
        const formattedPayments = response.data.map(item => ({
          id: item._id,
          title: item.type === 'course' ? (item.courseId?.title || 'Course Purchase') : 'Expert Session',
          type: item.type.charAt(0).toUpperCase() + item.type.slice(1),
          amount: item.amount || 0,
          date: new Date(item.createdAt),
          status: item.status.charAt(0).toUpperCase() + item.status.slice(1),
          icon: item.type === 'course' ? <BookOpen size={20} color="#623AD9" /> : <Calendar size={20} color="#623AD9" />
        }));

        setPayments(formattedPayments);
      }
    } catch (error) {
      console.error('Error fetching payment history:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchPaymentHistory();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchPaymentHistory();
  };

  const renderPaymentItem = ({ item }) => (
    <TouchableOpacity
      className="flex-row items-center bg-white p-4 mx-4 mb-3 rounded-2xl shadow-sm border border-gray-100"
      activeOpacity={0.7}
    >
      <View className="w-12 h-12 bg-purple-50 rounded-full items-center justify-center mr-4">
        {item.icon}
      </View>

      <View className="flex-1">
        <Text className="text-base font-semibold text-gray-800" numberOfLines={1}>
          {item.title}
        </Text>
        <View className="flex-row items-center mt-1">
          <Text className="text-gray-500 text-xs mr-2">{item.type}</Text>
          <View className="w-1 h-1 bg-gray-300 rounded-full mr-2" />
          <Text className="text-gray-500 text-xs">
            {format(item.date, 'MMM dd, yyyy')}
          </Text>
        </View>
      </View>

      <View className="items-end">
        <Text className="text-base font-bold text-gray-900">
          ₹{item.amount}
        </Text>
        <View className="bg-green-100 px-2 py-0.5 rounded-full mt-1">
          <Text className="text-green-700 text-[10px] font-bold uppercase">{item.status}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <StandardHeader title="Payment History" centeredTitle={true} />

      {loading && !refreshing ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#623AD9" />
          <Text className="mt-4 text-gray-500">Loading your history...</Text>
        </View>
      ) : (
        <FlatList
          data={payments}
          keyExtractor={(item) => item.id}
          renderItem={renderPaymentItem}
          contentContainerStyle={{ paddingTop: 16, paddingBottom: 40 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#623AD9']} />
          }
          ListEmptyComponent={
            <View className="items-center justify-center mt-20 px-8">
              <View className="w-20 h-20 bg-gray-100 rounded-full items-center justify-center mb-4">
                <CreditCard size={40} color="#9CA3AF" />
              </View>
              <Text className="text-lg font-bold text-gray-800 text-center">No Transactions Yet</Text>
              <Text className="text-gray-500 text-center mt-2">
                When you purchase courses or book sessions, they will appear here.
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
};

export default payment;
