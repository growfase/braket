-- Cup Predict — allow confirming a bracket before the payer's wallet is known.
-- The payout wallet is captured from the deposit transaction's sender
-- (check-payment) or from a connected wallet at confirm time.
alter table predictions alter column wallet drop not null;
