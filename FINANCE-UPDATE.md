# Finance update

Finance now separates visit review from document creation. An administrator or super administrator must confirm payroll time and invoicing time independently before a completed visit can enter a pay run or invoice. Reviews can use planned or actual duration, require a reason, detect stale visit changes and lock visits already included in active finance documents.

The Finance overview compares employee confirmed payroll time with weekly contracted hours from onboarding. It also compares client confirmed invoice time with effective-dated weekly service allowances. Client service-hour records include funding source and agreement reference. Variances are prorated for the selected date range.

The module includes visit filters, discrepancy and edited-time indicators, bulk review for up to 100 visits, discarded payroll/invoice views, client invoices, employee pay runs, invoice/pay rates, travel rates and the latest 100 finance changes. Currency is GBP and operational timestamps use Europe/London.

Travel rates are stored for future travel calculations but are not automatically added to pay runs, because rostered travel time and mileage records are not yet captured as approved finance inputs.

Validation completed: the production UI build passed, targeted Finance lint passed, Operations/Finance tests passed, the live Finance endpoints responded successfully, and browser checks passed for confirmation, overview, client service hours, travel rates, history and mobile width. Browser interaction checks used fictional intercepted records and did not change live finance data.
