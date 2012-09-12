/*
 * The contents of this file are subject to the OpenMRS Public License
 * Version 1.1 (the "License"); you may not use this file except in
 * compliance with the License. You may obtain a copy of the License at
 * http://license.openmrs.org
 *
 * Software distributed under the License is distributed on an "AS IS"
 * basis, WITHOUT WARRANTY OF ANY KIND, either express or implied. See the
 * License for the specific language governing rights and limitations
 * under the License.
 *
 * Copyright (C) OpenMRS, LLC.  All Rights Reserved.
 */
package org.openmrs.module.openhmis.cashier.api;

import org.junit.Assert;
import org.openmrs.api.PatientService;
import org.openmrs.api.ProviderService;
import org.openmrs.api.context.Context;
import org.openmrs.module.openhmis.cashier.api.model.*;

import java.math.BigDecimal;
import java.util.Iterator;
import java.util.List;
import java.util.Set;

public class IBillServiceTest extends IDataServiceTest<IBillService, Bill> {
	public static final String BILL_DATASET = BASE_DATASET_DIR + "BillTest.xml";

	private ProviderService providerService;
	private PatientService patientService;
	private IItemService itemService;
	private IPaymentModeService paymentModeService;

	@Override
	public void before() throws Exception {
		super.before();

		providerService = Context.getProviderService();
		patientService = Context.getPatientService();
		itemService = Context.getService(IItemService.class);
		paymentModeService = Context.getService(IPaymentModeService.class);

		executeDataSet(IItemServiceTest.ITEM_DATASET);
		executeDataSet(IPaymentModeServiceTest.PAYMENT_MODE_DATASET);
		executeDataSet(BILL_DATASET);
	}

	@Override
	protected Bill createEntity(boolean valid) {
		Bill bill = new Bill();

		if (valid) {
			bill.setCashier(providerService.getProvider(0));
			bill.setPatient(patientService.getPatient(0));
			bill.setReceiptNumber("Test 1234");
			bill.setStatus(BillStatus.PAID);
		}

		Item item = itemService.getById(0);
		bill.addLineItem(item, item.getPrices().iterator().next(), 1);
		item = itemService.getById(1);
		bill.addLineItem(item, item.getPrices().iterator().next(), 1);

		PaymentMode mode = paymentModeService.getById(0);
		bill.addPayment(mode, null, BigDecimal.valueOf(100));

		mode = paymentModeService.getById(1);
		bill.addPayment(mode, null, BigDecimal.valueOf(200));

		return bill;
	}

	@Override
	protected int getTestEntityCount() {
		return 1;
	}

	@Override
	protected void updateEntityFields(Bill bill) {
		bill.setCashier(providerService.getProvider(1));
		bill.setPatient(patientService.getPatient(2));
		bill.setReceiptNumber(bill.getReceiptNumber() + " updated");
		bill.setStatus(BillStatus.PENDING);

		List<BillLineItem> lines = bill.getLineItems();
		if (lines.size() > 0) {
			BillLineItem item = lines.get(0);

			item.setPrice(item.getPrice().multiply(BigDecimal.valueOf(2)));
			item.setPriceName(item.getPriceName() + " updated");

			if (lines.size() > 1) {
				item = lines.get(1);

				bill.removeLineItem(item);
			}
		}

		Item newItem = itemService.getById(2);
		bill.addLineItem(newItem, newItem.getPrices().iterator().next(), 3);

		Set<Payment> payments = bill.getPayments();
		if (payments.size() > 0) {
			Iterator<Payment> iterator = payments.iterator();

			Payment payment = iterator.next();
			payment.setAmount(payment.getAmount().divide(BigDecimal.valueOf(2)));

			if (payments.size() > 1) {
				payment = iterator.next();

				bill.removePayment(payment);
			}
		}

		bill.addPayment(paymentModeService.getById(2), null, BigDecimal.valueOf(303.11));
	}

	@Override
	protected void assertEntity(Bill expected, Bill actual) {
		super.assertEntity(expected, actual);

		Assert.assertNotNull(expected.getCashier());
		Assert.assertNotNull(actual.getCashier());
		Assert.assertNotNull(expected.getPatient());
		Assert.assertNotNull(actual.getPatient());

		Assert.assertEquals(expected.getReceiptNumber(), actual.getReceiptNumber());
		Assert.assertEquals(expected.getStatus(), actual.getStatus());

		Assert.assertEquals(expected.getLineItems().size(), actual.getLineItems().size());
		BillLineItem[] expectedItems = new BillLineItem[expected.getLineItems().size()];
		expected.getLineItems().toArray(expectedItems);
		BillLineItem[] actualItems = new BillLineItem[actual.getLineItems().size()];
		actual.getLineItems().toArray(actualItems);
		for (int i = 0; i < expected.getLineItems().size(); i++) {
			Assert.assertEquals(expectedItems[i].getId(), actualItems[i].getId());
			Assert.assertEquals(expectedItems[i].getItem(), actualItems[i].getItem());
			Assert.assertEquals(expectedItems[i].getPrice(), actualItems[i].getPrice());
			Assert.assertEquals(expectedItems[i].getPriceName(), actualItems[i].getPriceName());
			Assert.assertEquals(expectedItems[i].getQuantity(), actualItems[i].getQuantity());
			Assert.assertEquals(expectedItems[i].getUuid(), actualItems[i].getUuid());
		}

		Assert.assertEquals(expected.getPayments().size(), actual.getPayments().size());
		Payment[] expectedPayments = new Payment[expected.getPayments().size()];
		expected.getPayments().toArray(expectedPayments);
		Payment[] actualPayments = new Payment[actual.getPayments().size()];
		actual.getPayments().toArray(actualPayments);
		for (int i = 0; i < expected.getPayments().size(); i++) {
			Assert.assertEquals(expectedPayments[i].getId(), actualPayments[i].getId());
			Assert.assertEquals(expectedPayments[i].getPaymentMode(), actualPayments[i].getPaymentMode());
			Assert.assertEquals(expectedPayments[i].getAmount(), actualPayments[i].getAmount());
			Assert.assertEquals(expectedPayments[i].getUuid(), actualPayments[i].getUuid());
		}
	}
}
