#!/usr/bin/env python3

import requests
import sys
import json
from datetime import datetime

class MookiStoreAPITester:
    def __init__(self, base_url="https://mooki-single-vape.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.token = None
        self.tests_run = 0
        self.tests_passed = 0
        self.failed_tests = []
        self.product_id = None
        self.order_id = None
        self.message_id = None

    def log_test(self, name, success, details=""):
        """Log test results"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
            print(f"✅ {name} - PASSED")
        else:
            self.failed_tests.append({"test": name, "details": details})
            print(f"❌ {name} - FAILED: {details}")

    def run_test(self, name, method, endpoint, expected_status, data=None, headers=None):
        """Run a single API test"""
        url = f"{self.api_url}/{endpoint}"
        test_headers = {'Content-Type': 'application/json'}
        
        if self.token:
            test_headers['Authorization'] = f'Bearer {self.token}'
        
        if headers:
            test_headers.update(headers)

        try:
            if method == 'GET':
                response = requests.get(url, headers=test_headers, timeout=10)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=test_headers, timeout=10)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=test_headers, timeout=10)
            elif method == 'DELETE':
                response = requests.delete(url, headers=test_headers, timeout=10)

            success = response.status_code == expected_status
            
            if success:
                self.log_test(name, True)
                try:
                    return True, response.json()
                except:
                    return True, {}
            else:
                self.log_test(name, False, f"Expected {expected_status}, got {response.status_code}")
                return False, {}

        except Exception as e:
            self.log_test(name, False, f"Request failed: {str(e)}")
            return False, {}

    def test_root_endpoint(self):
        """Test root API endpoint"""
        return self.run_test("Root API", "GET", "", 200)

    def test_get_product(self):
        """Test getting product details"""
        success, response = self.run_test("Get Product", "GET", "product", 200)
        if success and response:
            self.product_id = response.get('id')
            print(f"   Product ID: {self.product_id}")
            print(f"   Product Name: {response.get('name')}")
            print(f"   Price: ${response.get('price')}")
            print(f"   Stock: {response.get('stock')}")
        return success

    def test_admin_login(self):
        """Test admin login"""
        login_data = {
            "username": "admin",
            "password": "admin123"
        }
        success, response = self.run_test("Admin Login", "POST", "auth/login", 200, login_data)
        if success and response:
            self.token = response.get('access_token')
            print(f"   Token received: {self.token[:20]}...")
        return success

    def test_admin_verify(self):
        """Test admin token verification"""
        if not self.token:
            self.log_test("Admin Verify", False, "No token available")
            return False
        return self.run_test("Admin Verify", "GET", "auth/verify", 200)[0]

    def test_create_order(self):
        """Test creating an order"""
        if not self.product_id:
            self.log_test("Create Order", False, "No product ID available")
            return False
            
        order_data = {
            "customer_name": "Test Customer",
            "phone": "+1234567890",
            "email": "test@example.com",
            "address": "123 Test Street, Test City, TC 12345",
            "payment_method": "Cash on Delivery",
            "items": [
                {
                    "product_id": self.product_id,
                    "product_name": "Strawberry Punch",
                    "quantity": 2,
                    "price": 29.99
                }
            ],
            "total": 59.98
        }
        
        success, response = self.run_test("Create Order", "POST", "orders", 200, order_data)
        if success and response:
            self.order_id = response.get('id')
            print(f"   Order ID: {self.order_id}")
        return success

    def test_get_orders(self):
        """Test getting all orders (admin only)"""
        if not self.token:
            self.log_test("Get Orders", False, "No admin token")
            return False
        return self.run_test("Get Orders", "GET", "orders", 200)[0]

    def test_get_single_order(self):
        """Test getting a single order"""
        if not self.order_id:
            self.log_test("Get Single Order", False, "No order ID available")
            return False
        return self.run_test("Get Single Order", "GET", f"orders/{self.order_id}", 200)[0]

    def test_update_order_status(self):
        """Test updating order status"""
        if not self.token or not self.order_id:
            self.log_test("Update Order Status", False, "Missing token or order ID")
            return False
            
        status_data = {"status": "Confirmed"}
        return self.run_test("Update Order Status", "PUT", f"orders/{self.order_id}/status", 200, status_data)[0]

    def test_create_contact_message(self):
        """Test creating a contact message"""
        message_data = {
            "name": "Test User",
            "email": "testuser@example.com",
            "phone": "+1234567890",
            "message": "This is a test message from the API test suite."
        }
        
        success, response = self.run_test("Create Contact Message", "POST", "contact", 201, message_data)
        if success and response:
            self.message_id = response.get('id')
            print(f"   Message ID: {self.message_id}")
        return success

    def test_get_contact_messages(self):
        """Test getting contact messages (admin only)"""
        if not self.token:
            self.log_test("Get Contact Messages", False, "No admin token")
            return False
        return self.run_test("Get Contact Messages", "GET", "contact", 200)[0]

    def test_mark_message_read(self):
        """Test marking message as read"""
        if not self.token or not self.message_id:
            self.log_test("Mark Message Read", False, "Missing token or message ID")
            return False
        return self.run_test("Mark Message Read", "PUT", f"contact/{self.message_id}/read", 200, {})[0]

    def test_update_product(self):
        """Test updating product (admin only)"""
        if not self.token:
            self.log_test("Update Product", False, "No admin token")
            return False
            
        update_data = {
            "price": 31.99,
            "stock": 95
        }
        return self.run_test("Update Product", "PUT", "product", 200, update_data)[0]

    def test_invalid_login(self):
        """Test login with invalid credentials"""
        login_data = {
            "username": "invalid",
            "password": "wrong"
        }
        success, _ = self.run_test("Invalid Login", "POST", "auth/login", 401, login_data)
        return success

    def test_unauthorized_access(self):
        """Test accessing admin endpoint without token"""
        # Temporarily remove token
        temp_token = self.token
        self.token = None
        success, _ = self.run_test("Unauthorized Access", "GET", "orders", 401)
        self.token = temp_token
        return success

    def run_all_tests(self):
        """Run all API tests"""
        print("🚀 Starting MOOKI STORE API Tests")
        print("=" * 50)
        
        # Basic API tests
        self.test_root_endpoint()
        self.test_get_product()
        
        # Authentication tests
        self.test_invalid_login()
        self.test_admin_login()
        self.test_admin_verify()
        
        # Order tests
        self.test_create_order()
        self.test_get_single_order()
        self.test_get_orders()
        self.test_update_order_status()
        
        # Contact tests
        self.test_create_contact_message()
        self.test_get_contact_messages()
        self.test_mark_message_read()
        
        # Product management tests
        self.test_update_product()
        
        # Security tests
        self.test_unauthorized_access()
        
        # Print results
        print("\n" + "=" * 50)
        print(f"📊 Test Results: {self.tests_passed}/{self.tests_run} passed")
        
        if self.failed_tests:
            print("\n❌ Failed Tests:")
            for test in self.failed_tests:
                print(f"   - {test['test']}: {test['details']}")
        
        success_rate = (self.tests_passed / self.tests_run) * 100 if self.tests_run > 0 else 0
        print(f"📈 Success Rate: {success_rate:.1f}%")
        
        return self.tests_passed == self.tests_run

def main():
    tester = MookiStoreAPITester()
    success = tester.run_all_tests()
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())