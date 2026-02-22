import { useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  Dimensions,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { DEFAULT_CURRENCIES, DEFAULT_KURS, formatRp } from '../data/config';

// ─── Konstanta ────────────────────────────────────────────────────────────────

const ALL_CURRENCIES = [
  { code: 'USD', name: 'US Dollar',        symbol: '$'   },
  { code: 'CNY', name: 'Yuan Tiongkok',    symbol: '¥'   },
  { code: 'JPY', name: 'Yen Jepang',       symbol: '¥'   },
  { code: 'SGD', name: 'Dolar Singapura',  symbol: 'S$'  },
  { code: 'AUD', name: 'Dolar Australia',  symbol: 'A$'  },
  { code: 'EUR', name: 'Euro',             symbol: '€'   },
  { code: 'GBP', name: 'Pound Inggris',    symbol: '£'   },
  { code: 'MYR', name: 'Ringgit Malaysia', symbol: 'RM'  },
  { code: 'THB', name: 'Baht Thailand',    symbol: '฿'   },
  { code: 'HKD', name: 'Dolar Hong Kong',  symbol: 'HK$' },
];

const DEFAULT_KURS_EXTENDED = {
  ...DEFAULT_KURS,
  EUR: 17650.00,
  GBP: 20480.00,
  MYR:  3520.00,
  THB:   445.00,
  HKD:  2085.00,
};

const DEFAULT_ACTIVE = DEFAULT_CURRENCIES[0].code;

// ── Layout badge grid
// marginHorizontal 16 kiri + 16 kanan = 32
// gap antar badge: (5 - 1) = 4 gaps × 8px = 32
// sisa untuk 5 badge: screenWidth - 32 - 32 = screenWidth - 64
const SCREEN_WIDTH   = Dimensions.get('window').width;
const BADGES_PER_ROW = 5;
const GRID_MARGIN    = 16; // kiri dan kanan
const BADGE_GAP      = 8;
const BADGE_WIDTH    =
  (SCREEN_WIDTH - GRID_MARGIN * 2 - BADGE_GAP * (BADGES_PER_ROW - 1)) / BADGES_PER_ROW;

// ─── CurrencyBadge ────────────────────────────────────────────────────────────

function CurrencyBadge({ currency, isActive, isSelected, onPress }) {
  return (
    <TouchableOpacity
      style={[
        styles.badge,
        isSelected && !isActive && styles.badgeSelected,
        isActive             && styles.badgeActive,
      ]}
      onPress={() => onPress(currency.code)}
      activeOpacity={0.75}
    >
      <Text
        style={[
          styles.badgeCode,
          isSelected && !isActive && styles.badgeCodeSelected,
          isActive             && styles.badgeCodeActive,
        ]}
        numberOfLines={1}
      >
        {currency.code}
      </Text>
      {isActive && (
        <Ionicons name="checkmark-circle" size={11} color="#FFF" style={styles.badgeCheck} />
      )}
    </TouchableOpacity>
  );
}

// ─── Screen utama ─────────────────────────────────────────────────────────────

export default function ConfigScreen() {
  const [kurs,         setKurs        ] = useState(DEFAULT_KURS_EXTENDED);
  const [activeCode,   setActiveCode  ] = useState(DEFAULT_ACTIVE);
  const [selectedCode, setSelectedCode] = useState(DEFAULT_ACTIVE);
  const [isEditing,    setIsEditing   ] = useState(false);
  const [inputVal,     setInputVal    ] = useState('');
  const inputRef = useRef(null);

  const selectedCurrency = ALL_CURRENCIES.find(c => c.code === selectedCode);

  const handleBadgePress = useCallback((code) => {
    if (isEditing && code !== selectedCode) {
      setIsEditing(false);
      Keyboard.dismiss();
    }
    setSelectedCode(code);
  }, [isEditing, selectedCode]);

  const handleSetActive = useCallback(() => {
    setActiveCode(selectedCode);
  }, [selectedCode]);

  const handleStartEdit = useCallback(() => {
    setInputVal(String(kurs[selectedCode]));
    setIsEditing(true);
    setTimeout(() => inputRef.current?.focus(), 80);
  }, [kurs, selectedCode]);

  const handleSave = useCallback(() => {
    const clean = parseFloat(inputVal.replace(',', '.'));
    if (isNaN(clean) || clean <= 0) {
      Alert.alert('Input tidak valid', 'Masukkan angka positif untuk nilai kurs.');
      return;
    }
    setKurs(prev => ({ ...prev, [selectedCode]: clean }));
    setIsEditing(false);
    Keyboard.dismiss();
  }, [inputVal, selectedCode]);

  const handleCancelEdit = useCallback(() => {
    setIsEditing(false);
    Keyboard.dismiss();
  }, []);

  const isActiveSelected = activeCode === selectedCode;

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="always"
        contentContainerStyle={styles.scrollContent}
      >
        {/* ── Form card — statis di atas */}
        <View style={styles.formCard}>
          <View style={styles.formHeader}>
            <View>
              <Text style={styles.formCode}>{selectedCurrency.code}</Text>
              <Text style={styles.formName}>{selectedCurrency.name}</Text>
            </View>
            {isActiveSelected ? (
              <View style={styles.activeTag}>
                <Ionicons name="checkmark-circle" size={12} color="#1E8449" />
                <Text style={styles.activeTagText}>Aktif untuk transaksi</Text>
              </View>
            ) : (
              <TouchableOpacity
                style={styles.setActiveBtn}
                onPress={handleSetActive}
                activeOpacity={0.8}
              >
                <Text style={styles.setActiveBtnText}>Jadikan Aktif</Text>
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.formDivider} />

          <Text style={styles.formLabel}>1 {selectedCurrency.code} =</Text>

          {isEditing ? (
            <View style={styles.inputRow}>
              <Text style={styles.inputPrefix}>Rp</Text>
              <TextInput
                ref={inputRef}
                style={styles.formInput}
                value={inputVal}
                onChangeText={setInputVal}
                keyboardType="numeric"
                returnKeyType="done"
                onSubmitEditing={handleSave}
                selectTextOnFocus
                placeholder="0"
                placeholderTextColor="#CCC"
              />
            </View>
          ) : (
            <View style={styles.inputRow}>
              <Text style={styles.inputPrefix}>Rp</Text>
              <Text style={styles.formValueText}>
                {kurs[selectedCode].toLocaleString('id-ID')}
              </Text>
            </View>
          )}

          <View style={styles.formActions}>
            {!isEditing ? (
              <TouchableOpacity
                style={styles.editBtn}
                onPress={handleStartEdit}
                activeOpacity={0.8}
              >
                <Ionicons name="pencil-outline" size={14} color="#1E8449" />
                <Text style={styles.editBtnText}>Edit Kurs</Text>
              </TouchableOpacity>
            ) : (
              <>
                <TouchableOpacity
                  style={styles.cancelBtn}
                  onPress={handleCancelEdit}
                  activeOpacity={0.7}
                >
                  <Text style={styles.cancelBtnText}>Batal</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.saveBtn}
                  onPress={handleSave}
                  activeOpacity={0.85}
                >
                  <Text style={styles.saveBtnText}>Simpan</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>

        {/* ── Badge grid — 5 per baris, full width */}
        <Text style={styles.sectionHeader}>Pilih Mata Uang</Text>
        <View style={styles.badgeGrid}>
          {ALL_CURRENCIES.map(currency => (
            <CurrencyBadge
              key={currency.code}
              currency={currency}
              isActive={activeCode === currency.code}
              isSelected={selectedCode === currency.code}
              onPress={handleBadgePress}
            />
          ))}
        </View>

        <View style={{ height: 32 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  scrollContent: {
    paddingTop: 16,
  },

  // ── Form card
  formCard: {
    backgroundColor: '#FFF',
    marginHorizontal: 16,
    borderRadius: 14,
    padding: 16,
    elevation: 3,
  },
  formHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  formCode: {
    fontSize: 22,
    fontWeight: '800',
    color: '#111',
    fontFamily: 'monospace',
    letterSpacing: 1,
  },
  formName: {
    fontSize: 12,
    color: '#AAA',
    marginTop: 2,
  },
  activeTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#E9F7EF',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  activeTagText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#1E8449',
  },
  setActiveBtn: {
    backgroundColor: '#F0F0F0',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  setActiveBtnText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#555',
  },
  formDivider: {
    height: 1,
    backgroundColor: '#F0F0F0',
    marginBottom: 14,
  },
  formLabel: {
    fontSize: 12,
    color: '#AAA',
    marginBottom: 6,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F8F8',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 4,
    marginBottom: 14,
  },
  inputPrefix: {
    fontSize: 15,
    fontWeight: '600',
    color: '#888',
    marginRight: 8,
  },
  formInput: {
    flex: 1,
    fontSize: 24,
    fontWeight: '700',
    color: '#111',
    paddingVertical: 8,
  },
  formValueText: {
    flex: 1,
    fontSize: 24,
    fontWeight: '700',
    color: '#111',
    paddingVertical: 8,
  },
  formActions: {
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'flex-end',
  },
  editBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#1E8449',
  },
  editBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1E8449',
  },
  cancelBtn: {
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 10,
    backgroundColor: '#F0F0F0',
  },
  cancelBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#555',
  },
  saveBtn: {
    paddingHorizontal: 24,
    paddingVertical: 9,
    borderRadius: 10,
    backgroundColor: '#1E8449',
  },
  saveBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFF',
  },

  // ── Badge grid — 5 per baris, full width
  sectionHeader: {
    fontSize: 12,
    fontWeight: '700',
    color: '#888',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginTop: 20,
    marginBottom: 10,
    marginHorizontal: 16,
  },
  badgeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: GRID_MARGIN,
    gap: BADGE_GAP,
  },
  badge: {
    // Lebar eksplisit dari kalkulasi — memastikan tepat 5 per baris tanpa sisa
    width: BADGE_WIDTH,
    height: 40,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E8E8E8',
    borderRadius: 8,
  },
  badgeSelected: {
    backgroundColor: '#D0EAD9',
    borderWidth: 1.5,
    borderColor: '#1E8449',
  },
  badgeActive: {
    backgroundColor: '#1E8449',
  },
  badgeCode: {
    fontSize: 13,
    fontWeight: '700',
    color: '#555',
    fontFamily: 'monospace',
  },
  badgeCodeSelected: {
    color: '#1E8449',
  },
  badgeCodeActive: {
    color: '#FFF',
  },
  badgeCheck: {
    marginLeft: 3,
  },
});