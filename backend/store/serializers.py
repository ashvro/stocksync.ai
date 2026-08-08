from rest_framework import serializers
from .models import Footwear, Order, OrderItem

class FootwearSerializer(serializers.ModelSerializer):
    # Mapping id <-> sku_id and other fields for React frontend convenience
    id = serializers.CharField(source='sku_id', required=False)
    minStock = serializers.IntegerField(source='min_stock', required=False)
    salesCount = serializers.IntegerField(source='sales_count', required=False)
    reviewsCount = serializers.IntegerField(source='reviews_count', required=False)

    class Meta:
        model = Footwear
        fields = [
            'id', 'sku_id', 'name', 'category', 'brand', 'price', 'cost', 
            'stock', 'minStock', 'sizes', 'color', 'rating', 'reviewsCount', 
            'image', 'description', 'featured', 'salesCount'
        ]

    def create(self, validated_data):
        sku = validated_data.get('sku_id')
        if not sku:
            validated_data['sku_id'] = f"SKU-{Footwear.objects.count() + 1001}"
        return super().create(validated_data)

class OrderItemSerializer(serializers.ModelSerializer):
    id = serializers.CharField(source='footwear_id', required=False)

    class Meta:
        model = OrderItem
        fields = ['id', 'footwear_id', 'name', 'price', 'qty', 'size']

class OrderSerializer(serializers.ModelSerializer):
    id = serializers.CharField(source='invoice_id', required=False)
    customerName = serializers.CharField(source='customer_name', required=False)
    customerPhone = serializers.CharField(source='customer_phone', required=False, allow_blank=True)
    customerEmail = serializers.CharField(source='customer_email', required=False, allow_blank=True)
    discountAmount = serializers.FloatField(source='discount_amount', required=False)
    paymentMethod = serializers.CharField(source='payment_method', required=False)
    items = OrderItemSerializer(many=True)

    class Meta:
        model = Order
        fields = [
            'id', 'invoice_id', 'customerName', 'customerPhone', 'customerEmail',
            'date', 'subtotal', 'discount', 'discountAmount', 'tax', 'total',
            'paymentMethod', 'status', 'items'
        ]

    def create(self, validated_data):
        items_data = validated_data.pop('items')
        invoice_id = validated_data.get('invoice_id')
        if not invoice_id:
            import random
            validated_data['invoice_id'] = f"INV-{random.randint(1000, 9999)}"
        
        order = Order.objects.create(**validated_data)

        # Create line items and update inventory stock automatically
        for item_data in items_data:
            footwear_id = item_data.get('footwear_id')
            qty = item_data.get('qty', 1)
            OrderItem.objects.create(order=order, **item_data)

            # Auto deduct stock in Django DBMS
            try:
                shoe = Footwear.objects.get(sku_id=footwear_id)
                shoe.stock = max(0, shoe.stock - qty)
                shoe.sales_count = (shoe.sales_count or 0) + qty
                shoe.save()
            except Footwear.DoesNotExist:
                pass

        return order

    def update(self, instance, validated_data):
        items_data = validated_data.pop('items', None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        # Replace line items wholesale on edit
        if items_data is not None:
            instance.items.all().delete()
            for item_data in items_data:
                OrderItem.objects.create(order=instance, **item_data)

        return instance
