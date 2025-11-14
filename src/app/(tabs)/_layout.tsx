import { Tabs } from 'expo-router';

import { useAuth } from '@/domains/auth';
import { CustomTabBar } from '@/shared';

const TabsLayout = () => {
  useAuth();

  return (
    <Tabs tabBar={(props) => <CustomTabBar {...props} />} screenOptions={{ headerShown: false }}>
      <Tabs.Screen name="home" options={{ title: 'Home' }} />
      <Tabs.Screen name="adopt" options={{ title: '입양공고' }} />
      <Tabs.Screen name="shelter" options={{ title: '내위치' }} />
      <Tabs.Screen name="community" options={{ title: '커뮤니티' }} />
      <Tabs.Screen name="profile" options={{ title: '프로필' }} />
    </Tabs>
  );
};

// const CustomTabBar: React.FC<BottomTabBarProps> = ({ state }) => {
//   const theme = useTheme();
//   const indicatorPosition = useSharedValue(state.index);
//   const tabBarTranslateY = useSharedValue(0);

//   const isOnDetailPage = useMemo(() => {
//     const currentRoute = state.routes[state.index];
//     if (!currentRoute.state) return false;

//     const nestedState = currentRoute.state as any;
//     if (nestedState.routes && nestedState.index !== undefined) {
//       const nestedRoute = nestedState.routes[nestedState.index];
//       return nestedRoute.name !== 'index';
//     }

//     return false;
//   }, [state]);

//   useEffect(() => {
//     indicatorPosition.value = withSpring(state.index, {
//       damping: 20,
//       stiffness: 200,
//       mass: 0.8
//     });
//   }, [state.index, indicatorPosition]);

//   useEffect(() => {
//     tabBarTranslateY.value = withTiming(isOnDetailPage ? 100 : 0, { duration: 250 });
//   }, [isOnDetailPage, tabBarTranslateY]);

//   const animatedIndicatorStyle = useAnimatedStyle(() => {
//     const tabWidth = 100 / TAB_ITEMS.length;
//     const translateX = interpolate(
//       indicatorPosition.value,
//       [0, TAB_ITEMS.length - 1],
//       [0, (TAB_ITEMS.length - 1) * tabWidth],
//       Extrapolate.CLAMP
//     );

//     return {
//       transform: [{ translateX: `${translateX + tabWidth / 2 - 10}%` }]
//     };
//   });

//   const animatedContainerStyle = useAnimatedStyle(() => ({
//     transform: [{ translateY: tabBarTranslateY.value }]
//   }));

//   const handleTabPress = useCallback((tabName: string, isActive: boolean) => {
//     if (!isActive) {
//       router.push(`/${tabName}` as any);
//     }
//   }, []);

//   const renderIcon = useCallback(
//     (IconComponent: React.ComponentType<any>, isActive: boolean) => {
//       return (
//         <IconComponent
//           width={24}
//           height={24}
//           color={theme.black900.val}
//           stroke={theme.black900.val}
//           strokeWidth={1.5}
//           fill={isActive ? theme.black900.val : 'none'}
//         />
//       );
//     },
//     [theme.black900.val]
//   );

//   return (
//     <Animated.View style={animatedContainerStyle}>
//       <Container>
//         <AnimatedIndicator style={[animatedIndicatorStyle, { zIndex: 10 }]} />
//         {TAB_ITEMS.map((item, index) => {
//           const isActive = state.index === index;

//           return (
//             <TabItemContainer
//               key={item.name}
//               onPress={() => handleTabPress(item.name, isActive)}
//               opacity={isActive ? 1 : 0.7}
//               hoverStyle={{ opacity: 0.8 }}
//               pressStyle={{ opacity: 0.6 }}
//             >
//               <TabIconWrapper>{renderIcon(item.icon, isActive)}</TabIconWrapper>
//               {isActive ? <ActiveTabLabel>{item.label}</ActiveTabLabel> : <TabLabel>{item.label}</TabLabel>}
//             </TabItemContainer>
//           );
//         })}
//       </Container>
//     </Animated.View>
//   );
// };

export default TabsLayout;
