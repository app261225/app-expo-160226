import { useState, useCallback, useEffect, useRef } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  BackHandler, Alert, Modal, Pressable, Animated,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import DashboardScreen from './DashboardScreen';
import ProductsScreen from './ProductsScreen';
import LogsScreen from './LogsScreen';
import ConfigScreen from './ConfigScreen';

// ─── Konfigurasi ──────────────────────────────────────────────────────────────

const TABS = [
  { key: 'dashboard', label: 'Dashboard',   icon: 'home-outline'     },
  { key: 'products',  label: 'Produk',      icon: 'cube-outline'     },
  { key: 'logs',      label: 'Log',         icon: 'list-outline'     },
  { key: 'config',    label: 'Konfigurasi', icon: 'settings-outline' },
];

const MENU_BY_SCREEN = {
  dashboard: [
    { key: 'logs',    label: 'Log',         icon: 'list-outline'     },
    { key: 'config',  label: 'Konfigurasi', icon: 'settings-outline' },
    { key: 'refresh', label: 'Refresh',     icon: 'refresh-outline'  },
  ],
  products: [
    { key: 'logs',    label: 'Log',         icon: 'list-outline'     },
    { key: 'config',  label: 'Konfigurasi', icon: 'settings-outline' },
    { key: 'refresh', label: 'Refresh',     icon: 'refresh-outline'  },
  ],
  logs: [
    { key: 'refresh', label: 'Refresh',     icon: 'refresh-outline'  },
  ],
  config: [
    { key: 'refresh', label: 'Refresh',     icon: 'refresh-outline'  },
  ],
};

// ─── Dropdown ─────────────────────────────────────────────────────────────────

function DropdownMenu({ visible, onClose, onSelect, anchorTop, anchorRight, items }) {
  const opacity    = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(-6)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(opacity,    { toValue: 1, duration: 120, useNativeDriver: true }),
        Animated.timing(translateY, { toValue: 0, duration: 120, useNativeDriver: true }),
      ]).start();
    } else {
      opacity.setValue(0);
      translateY.setValue(-6);
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <Modal transparent animationType="none" onRequestClose={onClose}>
      <Pressable style={styles.menuOverlay} onPress={onClose}>
        <Animated.View
          style={[
            styles.menuBox,
            { top: anchorTop, right: anchorRight, opacity, transform: [{ translateY }] },
          ]}
        >
          {items.map((item, index) => (
            <TouchableOpacity
              key={item.key}
              style={[styles.menuItem, index < items.length - 1 && styles.menuItemBorder]}
              onPress={() => { onClose(); onSelect(item.key); }}
              activeOpacity={0.7}
            >
              <Ionicons name={item.icon} size={18} color="#333" style={styles.menuItemIcon} />
              <Text style={styles.menuItemLabel}>{item.label}</Text>
            </TouchableOpacity>
          ))}
        </Animated.View>
      </Pressable>
    </Modal>
  );
}

// ─── Root Navigator ───────────────────────────────────────────────────────────

export default function RootScreen() {
  const [active, setActive]           = useState('dashboard');
  // previousScreen: satu level history untuk back yang kontekstual
  const [previousScreen, setPreviousScreen] = useState('dashboard');
  const [menuVisible, setMenuVisible] = useState(false);
  const [menuAnchor, setMenuAnchor]   = useState({ top: 0, right: 8 });
  const menuBtnRef = useRef(null);
  const insets     = useSafeAreaInsets();

  const activeTab   = TABS.find(t => t.key === active);
  const isDashboard = active === 'dashboard';
  const menuItems   = MENU_BY_SCREEN[active] ?? [];

  // ── Navigasi terpusat — selalu catat previousScreen
  const navigate = useCallback((to) => {
    setPreviousScreen(active);
    setActive(to);
  }, [active]);

  // ── Back: kembali ke previousScreen, bukan selalu dashboard
  const handleBack = useCallback(() => {
    setActive(previousScreen);
    setPreviousScreen('dashboard');
  }, [previousScreen]);

  const handleMenuOpen = useCallback(() => {
    menuBtnRef.current?.measure((_x, _y, width, height, pageX, pageY) => {
      setMenuAnchor({ top: pageY + height - 20, right: 8 });
      setMenuVisible(true);
    });
  }, []);

  // ── Hardware back button
  useEffect(() => {
    const handler = BackHandler.addEventListener('hardwareBackPress', () => {
      if (menuVisible) {
        setMenuVisible(false);
        return true;
      }
      if (!isDashboard) {
        handleBack();
        return true;
      }
      Alert.alert(
        'Keluar Aplikasi', 'Yakin ingin keluar?',
        [
          { text: 'Batal',  style: 'cancel' },
          { text: 'Keluar', style: 'destructive', onPress: () => BackHandler.exitApp() },
        ],
        { cancelable: true }
      );
      return true;
    });
    return () => handler.remove();
  }, [isDashboard, menuVisible, handleBack]);

  const handleMenuSelect = useCallback((key) => {
    if (key === 'refresh') return; // placeholder
    if (key === 'logs')   { navigate('logs');   return; }
    if (key === 'config') { navigate('config'); return; }
  }, [navigate]);

  return (
    <View style={styles.root}>

      {/* ── Header */}
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <TouchableOpacity
          style={styles.headerIcon}
          onPress={isDashboard ? undefined : handleBack}
          activeOpacity={isDashboard ? 1 : 0.7}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons
            name={isDashboard ? 'home-outline' : 'arrow-back'}
            size={22}
            color="#111"
          />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>{activeTab?.label}</Text>

        <TouchableOpacity
          ref={menuBtnRef}
          style={styles.headerIcon}
          onPress={handleMenuOpen}
          activeOpacity={0.7}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="ellipsis-vertical" size={22} color="#111" />
        </TouchableOpacity>
      </View>

      {/* ── Body */}
      <View style={styles.body}>
        <View style={[styles.screen, active !== 'dashboard' && styles.hidden]}
              pointerEvents={active === 'dashboard' ? 'auto' : 'none'}>
          <DashboardScreen onNavigate={navigate} />
        </View>
        <View style={[styles.screen, active !== 'products' && styles.hidden]}
              pointerEvents={active === 'products' ? 'auto' : 'none'}>
          <ProductsScreen />
        </View>
        <View style={[styles.screen, active !== 'logs' && styles.hidden]}
              pointerEvents={active === 'logs' ? 'auto' : 'none'}>
          <LogsScreen />
        </View>
        <View style={[styles.screen, active !== 'config' && styles.hidden]}
              pointerEvents={active === 'config' ? 'auto' : 'none'}>
          <ConfigScreen />
        </View>
      </View>

      <View style={{ height: insets.bottom, backgroundColor: '#FFFFFF' }} />

      <DropdownMenu
        visible={menuVisible}
        onClose={() => setMenuVisible(false)}
        onSelect={handleMenuSelect}
        anchorTop={menuAnchor.top}
        anchorRight={menuAnchor.right}
        items={menuItems}
      />

    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#CCCCCC',
  },
  headerIcon: {
    width: 32,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111',
  },
  body: {
    flex: 1,
  },
  screen: {
    ...StyleSheet.absoluteFillObject,
  },
  hidden: {
    display: 'none',
  },
  menuOverlay: {
    flex: 1,
  },
  menuBox: {
    position: 'absolute',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    minWidth: 200,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  menuItemBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#ECECEC',
  },
  menuItemIcon: {
    marginRight: 12,
  },
  menuItemLabel: {
    fontSize: 14,
    color: '#222',
  },
});