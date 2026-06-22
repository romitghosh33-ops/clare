-- Decrement stock quantity safely
create or replace function public.decrement_stock(product_id uuid, qty integer)
returns void as $$
begin
  update public.products
  set stock_quantity = greatest(0, stock_quantity - qty)
  where id = product_id and track_inventory = true;
end;
$$ language plpgsql security definer;
