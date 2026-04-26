import React from 'react';
import { StatusBar } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons, MaterialIcons, FontAwesome, MaterialCommunityIcons } from '@expo/vector-icons';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';

// Note: We'll let the default splash screen handle auto-hiding for reliability
// SplashScreen.preventAutoHideAsync();

import { AuthProvider, useAuth } from './src/context/AuthContext';

// Auth screens
import LoginScreen from './src/screens/auth/LoginScreen';
import RegisterScreen from './src/screens/auth/RegisterScreen';

// Member 1 — Profile / User Pages
import ProfileScreen from './src/screens/profile/ProfileScreen';
import UserDashboardScreen from './src/screens/user/UserDashboardScreen';

// Member 2 — Reader
import ReaderScreen from './src/screens/reader/ReaderScreen';

// Member 3 — Activity
import ActivityScreen from './src/screens/activity/ActivityScreen';

// Member 4 — Feedback
import FeedbackScreen from './src/screens/feedback/FeedbackScreen';

// Member 5 — Books
import BooksScreen from './src/screens/books/BooksScreen';
import BookDetailScreen from './src/screens/books/BookDetailScreen';
import AddBookScreen from './src/screens/books/AddBookScreen';
import EditBookScreen from './src/screens/books/EditBookScreen';

// Member 6 — Search
import SearchScreen from './src/screens/search/SearchScreen';

// QR Scanner
import QRScannerScreen from './src/screens/qr/QRScannerScreen';

// Member 7 — Bookshelf
import BookshelfScreen from './src/screens/bookshelf/BookshelfScreen';

// Admin screens
import AdminDashboardScreen from './src/screens/admin/AdminDashboardScreen';
import AdminUsersScreen from './src/screens/admin/AdminUsersScreen';
import AdminFeedbackScreen from './src/screens/admin/AdminFeedbackScreen';
import AdminBooksScreen from './src/screens/admin/AdminBooksScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// ─── Auth Stack ────────────────────────────────────────────────────────────────
function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
    </Stack.Navigator>
  );
}

// ─── Helper: tab bar icon factory ─────────────────────────────────────────────
function tabIcon(name, focusedName) {
  return ({ focused, color, size }) => (
    <Ionicons name={focused ? focusedName : name} size={size} color={color} />
  );
}

// ─── User Main Tabs ────────────────────────────────────────────────────────────
function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#1e3a5f',
        tabBarInactiveTintColor: '#aaa',
        tabBarStyle: { borderTopColor: '#f0f0f0', elevation: 8 },
      }}
    >
      <Tab.Screen
        name="Home"
        component={UserDashboardScreen}
        options={{ title: 'Home', tabBarIcon: tabIcon('home-outline', 'home') }}
      />
      <Tab.Screen
        name="Bookshelf"
        component={BookshelfNavigator}
        options={{ title: 'Library', tabBarIcon: tabIcon('library-outline', 'library') }}
      />
      <Tab.Screen
        name="Books"
        component={BooksNavigator}
        options={{ title: 'Store', tabBarIcon: tabIcon('cart-outline', 'cart') }}
      />
      <Tab.Screen
        name="Search"
        component={SearchNavigator}
        options={{ title: 'Search', tabBarIcon: tabIcon('search-outline', 'search') }}
      />
      <Tab.Screen
        name="Activity"
        component={ActivityScreen}
        options={{ title: 'Stats', tabBarIcon: tabIcon('bar-chart-outline', 'bar-chart') }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileNavigator}
        options={{ title: 'Profile', tabBarIcon: tabIcon('person-outline', 'person') }}
      />
    </Tab.Navigator>
  );
}

// ─── Admin Tabs ────────────────────────────────────────────────────────────────
function AdminTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#1e3a5f',
        tabBarInactiveTintColor: '#aaa',
        tabBarStyle: { borderTopColor: '#f0f0f0', elevation: 8 },
      }}
    >
      <Tab.Screen
        name="AdminDashboard"
        component={AdminDashboardNavigator}
        options={{ title: 'Dashboard', tabBarIcon: tabIcon('grid-outline', 'grid') }}
      />
      <Tab.Screen
        name="AdminUsers"
        component={AdminUsersScreen}
        options={{ title: 'Users', tabBarIcon: tabIcon('people-outline', 'people') }}
      />
      <Tab.Screen
        name="AdminFeedback"
        component={AdminFeedbackScreen}
        options={{ title: 'Feedback', tabBarIcon: tabIcon('chatbubbles-outline', 'chatbubbles') }}
      />
      <Tab.Screen
        name="Books"
        component={AdminBooksNavigator}
        options={{ title: 'Books', tabBarIcon: tabIcon('library-outline', 'library') }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileNavigator}
        options={{ title: 'Profile', tabBarIcon: tabIcon('person-outline', 'person') }}
      />
    </Tab.Navigator>
  );
}

// ─── Nested Stacks ─────────────────────────────────────────────────────────────
function BooksNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="BooksList" component={BooksScreen} />
      <Stack.Screen name="BookDetail" component={BookDetailScreen} options={{ title: 'Book Details' }} />
      <Stack.Screen 
        name="Reader" 
        component={ReaderScreen} 
        options={{ 
          title: 'Reader', 
          headerShown: true, 
          headerStyle: { backgroundColor: '#1e3a5f' }, 
          headerTintColor: '#fff',
        }} 
      />
      <Stack.Screen name="AddBook" component={AddBookScreen} options={{ title: 'Add Book', headerShown: true, headerStyle: { backgroundColor: '#1e3a5f' }, headerTintColor: '#fff' }} />
      <Stack.Screen name="EditBook" component={EditBookScreen} options={{ title: 'Edit Book', headerShown: true, headerStyle: { backgroundColor: '#1e3a5f' }, headerTintColor: '#fff' }} />
    </Stack.Navigator>
  );
}

function SearchNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="SearchMain" component={SearchScreen} />
      <Stack.Screen name="BookDetail" component={BookDetailScreen} />
      <Stack.Screen name="Reader" component={ReaderScreen} options={{ headerShown: true, headerStyle: { backgroundColor: '#1e3a5f' }, headerTintColor: '#fff' }} />
      <Stack.Screen name="QRScanner" component={QRScannerScreen} options={{ title: 'Scan QR Code', headerShown: true, headerStyle: { backgroundColor: '#1e3a5f' }, headerTintColor: '#fff' }} />
    </Stack.Navigator>
  );
}

function BookshelfNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="BookshelfMain" component={BookshelfScreen} />
      <Stack.Screen name="BookDetail" component={BookDetailScreen} />
      <Stack.Screen name="Reader" component={ReaderScreen} options={{ headerShown: true, headerStyle: { backgroundColor: '#1e3a5f' }, headerTintColor: '#fff' }} />
    </Stack.Navigator>
  );
}

function ProfileNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ProfileMain" component={ProfileScreen} />
      <Stack.Screen name="ActivityDetail" component={ActivityScreen} />
      <Stack.Screen name="Feedback" component={FeedbackScreen} options={{ title: 'Feedback', headerShown: true, headerStyle: { backgroundColor: '#1e3a5f' }, headerTintColor: '#fff' }} />
    </Stack.Navigator>
  );
}

function AdminDashboardNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Dashboard" component={AdminDashboardScreen} />
    </Stack.Navigator>
  );
}

function AdminBooksNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="AdminBooksMain" component={AdminBooksScreen} />
      <Stack.Screen name="AddBook" component={AddBookScreen} options={{ title: 'Add Book', headerShown: true, headerStyle: { backgroundColor: '#1e3a5f' }, headerTintColor: '#fff' }} />
      <Stack.Screen name="EditBook" component={EditBookScreen} options={{ title: 'Edit Book', headerShown: true, headerStyle: { backgroundColor: '#1e3a5f' }, headerTintColor: '#fff' }} />
    </Stack.Navigator>
  );
}

// ─── Root Navigator (auth guard) ───────────────────────────────────────────────
function RootNavigator() {
  const { user, loading } = useAuth();

  if (loading) return null; // Splash / loading state

  if (!user) return <AuthStack />;

  return user.role === 'admin' ? <AdminTabs /> : <MainTabs />;
}

// ─── App Root ──────────────────────────────────────────────────────────────────
export default function App() {
  const [fontsLoaded] = useFonts({
    ...Ionicons.font,
    ...MaterialIcons.font,
    ...FontAwesome.font,
    ...MaterialCommunityIcons.font,
  });

  // Automatically hide splash screen when ready
  React.useEffect(() => {
    async function hide() {
      if (fontsLoaded) {
        await SplashScreen.hideAsync();
      }
    }
    hide();
  }, [fontsLoaded]);

  return (
    <AuthProvider>
      <NavigationContainer>
        <StatusBar barStyle="light-content" backgroundColor="#1e3a5f" />
        <RootNavigator />
      </NavigationContainer>
    </AuthProvider>
  );
}
