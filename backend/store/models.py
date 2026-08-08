from django.db import models

class Footwear(models.Model):
    sku_id = models.CharField(max_length=50, primary_key=True)
    name = models.CharField(max_length=200)
    category = models.CharField(max_length=100)
    brand = models.CharField(max_length=100)
    price = models.FloatField(default=0.0)
    cost = models.FloatField(default=0.0)
    stock = models.IntegerField(default=0)
    min_stock = models.IntegerField(default=10)
    sizes = models.JSONField(default=list)
    color = models.CharField(max_length=100, blank=True)
    rating = models.FloatField(default=4.8)
    reviews_count = models.IntegerField(default=50)
    image = models.TextField(blank=True)
    description = models.TextField(blank=True)
    featured = models.BooleanField(default=False)
    sales_count = models.IntegerField(default=0)

    def __str__(self):
        return f"{self.sku_id} - {self.name}"

class Order(models.Model):
    invoice_id = models.CharField(max_length=50, primary_key=True)
    customer_name = models.CharField(max_length=150)
    customer_phone = models.CharField(max_length=50, blank=True)
    customer_email = models.CharField(max_length=150, blank=True)
    date = models.CharField(max_length=100)
    subtotal = models.FloatField(default=0.0)
    discount = models.FloatField(default=0.0)
    discount_amount = models.FloatField(default=0.0)
    tax = models.FloatField(default=0.0)
    total = models.FloatField(default=0.0)
    payment_method = models.CharField(max_length=50, default='Credit Card')
    status = models.CharField(max_length=50, default='Completed')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.invoice_id} - {self.customer_name}"

class OrderItem(models.Model):
    order = models.ForeignKey(Order, related_name='items', on_delete=models.CASCADE)
    footwear_id = models.CharField(max_length=50)
    name = models.CharField(max_length=200)
    price = models.FloatField(default=0.0)
    qty = models.IntegerField(default=1)
    size = models.IntegerField(default=9)
