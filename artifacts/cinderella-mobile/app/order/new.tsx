import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Alert, Platform, Modal, FlatList,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { useQueryClient } from '@tanstack/react-query';
import {
  useCreateOrder,
  useUpdateOrder,
  useGetProducts,
  useGetOrder,
} from '@workspace/api-client-react';
import { InputField } from '@/components/InputField';
import { GoldButton } from '@/components/GoldButton';
import type { Product } from '@workspace/api-client-react';

const PROVINCES = ['بغداد', 'البصرة', 'الموصل', 'أربيل', 'النجف', 'كربلاء', 'الأنبار', 'ديالى', 'صلاح الدين', 'واسط', 'ذي قار', 'ميسان', 'المثنى', 'القادسية', 'بابل', 'كركوك', 'السليمانية', 'دهوك'];
const PAYMENT_METHODS = ['نقداً', 'دفع إلكتروني', 'تحويل بنكي'];
const DELIVERY_COMPANIES = ['DHL', 'Aramex', 'FedEx', 'شركة محلية', 'توصيل مباشر'];

function PickerModal({
  visible,
  title,
  options,
  onSelect,
  onClose,
}: {
  visible: boolean;
  title: string;
  options: string[];
  onSelect: (v: string) => void;
  onClose: () => void;
}) {
  return (
    <Modal visible={visible} transparent animationType="slide">
      <TouchableOpacity style={styles.modalOverlay} onPress={onClose} />
      <View style={styles.modalSheet}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>{title}</Text>
          <TouchableOpacity onPress={onClose}>
            <Text style={styles.modalClose}>✕</Text>
          </TouchableOpacity>
        </View>
        <FlatList
          data={options}
          keyExtractor={(o) => o}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.modalOption} onPress={() => { onSelect(item); onClose(); }}>
              <Text style={styles.modalOptionText}>{item}</Text>
            </TouchableOpacity>
          )}
        />
      </View>
    </Modal>
  );
}

export default function NewOrderScreen() {
  const { editId } = useLocalSearchParams<{ editId?: string }>();
  const isEdit = !!editId;
  const editOrderId = editId ? parseInt(editId, 10) : undefined;
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();

  const { data: products } = useGetProducts();
  const { data: existingOrder } = useGetOrder(editOrderId ?? 0, { query: { enabled: isEdit } });
  const { mutateAsync: createOrder, isPending: creating } = useCreateOrder();
  const { mutateAsync: updateOrder, isPending: updating } = useUpdateOrder();

  const [form, setForm] = useState({
    customerName: '',
    phone: '',
    province: '',
    district: '',
    address: '',
    productId: 0,
    quantity: '1',
    salePrice: '',
    paymentMethod: '',
    deliveryCompany: '',
    notes: '',
  });

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showProductPicker, setShowProductPicker] = useState(false);
  const [showProvincePicker, setShowProvincePicker] = useState(false);
  const [showPaymentPicker, setShowPaymentPicker] = useState(false);
  const [showDeliveryPicker, setShowDeliveryPicker] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (existingOrder && isEdit) {
      setForm({
        customerName: existingOrder.customerName ?? '',
        phone: existingOrder.phone ?? '',
        province: existingOrder.province ?? '',
        district: existingOrder.district ?? '',
        address: existingOrder.address ?? '',
        productId: existingOrder.productId,
        quantity: String(existingOrder.quantity),
        salePrice: String(existingOrder.salePrice),
        paymentMethod: existingOrder.paymentMethod ?? '',
        deliveryCompany: existingOrder.deliveryCompany ?? '',
        notes: existingOrder.notes ?? '',
      });
      const p = products?.find((p) => p.id === existingOrder.productId);
      if (p) setSelectedProduct(p);
    }
  }, [existingOrder, isEdit, products]);

  const set = (key: keyof typeof form) => (val: string) => setForm((f) => ({ ...f, [key]: val }));

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.customerName.trim()) e.customerName = 'مطلوب';
    if (!form.phone.trim()) e.phone = 'مطلوب';
    if (!form.productId) e.productId = 'اختر منتجاً';
    if (!form.salePrice || isNaN(parseFloat(form.salePrice))) e.salePrice = 'سعر غير صحيح';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const payload = {
      customerName: form.customerName.trim(),
      phone: form.phone.trim(),
      province: form.province || null,
      district: form.district || null,
      address: form.address || null,
      productId: form.productId,
      quantity: parseInt(form.quantity, 10) || 1,
      salePrice: parseFloat(form.salePrice),
      paymentMethod: form.paymentMethod || null,
      deliveryCompany: form.deliveryCompany || null,
      notes: form.notes || null,
    };
    try {
      if (isEdit && editOrderId) {
        await updateOrder({ id: editOrderId, data: payload });
      } else {
        await createOrder({ data: payload });
      }
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      queryClient.invalidateQueries();
      router.back();
    } catch (e: any) {
      Alert.alert('خطأ', e?.data?.error ?? 'فشل الحفظ');
    }
  };

  const productOptions = products?.map((p) => p.name) ?? [];

  return (
    <View style={styles.root}>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: insets.bottom + (Platform.OS === 'web' ? 34 : 16) + 80 },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.sectionLabel}>بيانات العميل</Text>
        <InputField label="اسم العميل *" value={form.customerName} onChangeText={set('customerName')} error={errors.customerName} placeholder="أدخل اسم العميل" />
        <InputField label="رقم الهاتف *" value={form.phone} onChangeText={set('phone')} error={errors.phone} placeholder="07xxxxxxxxx" keyboardType="phone-pad" />

        {/* Province picker */}
        <Text style={styles.fieldLabel}>المحافظة</Text>
        <TouchableOpacity style={styles.pickerBtn} onPress={() => setShowProvincePicker(true)}>
          <Text style={[styles.pickerBtnText, !form.province && { color: '#555' }]}>
            {form.province || 'اختر المحافظة'}
          </Text>
        </TouchableOpacity>

        <InputField label="القضاء" value={form.district} onChangeText={set('district')} placeholder="القضاء أو المنطقة" />
        <InputField label="العنوان التفصيلي" value={form.address} onChangeText={set('address')} placeholder="الشارع، البناية، الطابق..." multiline />

        <Text style={styles.sectionLabel}>تفاصيل المنتج</Text>

        {/* Product picker */}
        <Text style={styles.fieldLabel}>المنتج *</Text>
        <TouchableOpacity
          style={[styles.pickerBtn, errors.productId && styles.pickerBtnError]}
          onPress={() => setShowProductPicker(true)}
        >
          <Text style={[styles.pickerBtnText, !selectedProduct && { color: '#555' }]}>
            {selectedProduct ? selectedProduct.name : 'اختر المنتج'}
          </Text>
        </TouchableOpacity>
        {errors.productId ? <Text style={styles.errorText}>{errors.productId}</Text> : null}
        {selectedProduct && (
          <Text style={styles.productHint}>السعر الأساسي: {selectedProduct.price.toLocaleString('ar-IQ')} د.ع</Text>
        )}

        <InputField
          label="الكمية"
          value={form.quantity}
          onChangeText={set('quantity')}
          keyboardType="numeric"
          placeholder="1"
        />
        <InputField
          label="سعر البيع *"
          value={form.salePrice}
          onChangeText={set('salePrice')}
          error={errors.salePrice}
          keyboardType="numeric"
          placeholder="0"
        />

        <Text style={styles.sectionLabel}>معلومات الشحن</Text>

        {/* Payment method */}
        <Text style={styles.fieldLabel}>طريقة الدفع</Text>
        <TouchableOpacity style={styles.pickerBtn} onPress={() => setShowPaymentPicker(true)}>
          <Text style={[styles.pickerBtnText, !form.paymentMethod && { color: '#555' }]}>
            {form.paymentMethod || 'اختر طريقة الدفع'}
          </Text>
        </TouchableOpacity>

        {/* Delivery company */}
        <Text style={styles.fieldLabel}>شركة التوصيل</Text>
        <TouchableOpacity style={styles.pickerBtn} onPress={() => setShowDeliveryPicker(true)}>
          <Text style={[styles.pickerBtnText, !form.deliveryCompany && { color: '#555' }]}>
            {form.deliveryCompany || 'اختر شركة التوصيل'}
          </Text>
        </TouchableOpacity>

        <InputField label="ملاحظات" value={form.notes} onChangeText={set('notes')} placeholder="ملاحظات إضافية..." multiline />

        <GoldButton
          title={isEdit ? 'حفظ التعديلات' : 'إضافة الطلب'}
          onPress={handleSubmit}
          loading={creating || updating}
          style={{ marginTop: 8 }}
        />
      </ScrollView>

      {/* Modals */}
      <PickerModal
        visible={showProductPicker}
        title="اختر المنتج"
        options={productOptions}
        onSelect={(name) => {
          const p = products?.find((p) => p.name === name);
          if (p) { setSelectedProduct(p); setForm((f) => ({ ...f, productId: p.id, salePrice: String(p.price) })); }
        }}
        onClose={() => setShowProductPicker(false)}
      />
      <PickerModal visible={showProvincePicker} title="اختر المحافظة" options={PROVINCES} onSelect={(v) => setForm((f) => ({ ...f, province: v }))} onClose={() => setShowProvincePicker(false)} />
      <PickerModal visible={showPaymentPicker} title="طريقة الدفع" options={PAYMENT_METHODS} onSelect={(v) => setForm((f) => ({ ...f, paymentMethod: v }))} onClose={() => setShowPaymentPicker(false)} />
      <PickerModal visible={showDeliveryPicker} title="شركة التوصيل" options={DELIVERY_COMPANIES} onSelect={(v) => setForm((f) => ({ ...f, deliveryCompany: v }))} onClose={() => setShowDeliveryPicker(false)} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0D0D0D' },
  content: { padding: 16 },
  sectionLabel: {
    fontFamily: 'Cairo_700Bold',
    fontSize: 18,
    color: '#F2F2F2',
    textAlign: 'right',
    marginTop: 8,
    marginBottom: 12,
  },
  fieldLabel: {
    fontFamily: 'Cairo_600SemiBold',
    fontSize: 14,
    color: '#F2F2F2',
    marginBottom: 6,
    textAlign: 'right',
  },
  pickerBtn: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    backgroundColor: '#1F1F1F',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#2D2516',
    paddingHorizontal: 14,
    paddingVertical: 13,
    marginBottom: 16,
  },
  pickerBtnError: { borderColor: '#D93030' },
  pickerBtnText: { fontFamily: 'Cairo_400Regular', fontSize: 15, color: '#F2F2F2', flex: 1, textAlign: 'right' },
  productHint: { fontFamily: 'Cairo_400Regular', fontSize: 13, color: '#10B981', textAlign: 'right', marginTop: -12, marginBottom: 12 },
  errorText: { fontFamily: 'Cairo_400Regular', fontSize: 12, color: '#D93030', textAlign: 'right', marginTop: -12, marginBottom: 12 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)' },
  modalSheet: {
    backgroundColor: '#1F1F1F',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '60%',
    paddingBottom: 32,
  },
  modalHeader: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#2D2516',
  },
  modalTitle: { fontFamily: 'Cairo_700Bold', fontSize: 18, color: '#F2F2F2' },
  modalClose: { fontFamily: 'Cairo_400Regular', fontSize: 18, color: '#999', paddingHorizontal: 8 },
  modalOption: { paddingVertical: 14, paddingHorizontal: 20, borderBottomWidth: 1, borderBottomColor: '#2D251644' },
  modalOptionText: { fontFamily: 'Cairo_400Regular', fontSize: 16, color: '#F2F2F2', textAlign: 'right' },
});
