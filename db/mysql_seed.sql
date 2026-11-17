-- =============================================================================
-- API & TEXTILE - MYSQL INITIAL SEED DATA SCRIPT
-- Target Database: wearora_ecommerce
-- Generated Date: 2026-11-09
-- =============================================================================

USE `wearora_ecommerce`;

SET FOREIGN_KEY_CHECKS = 0;

-- 1. SEED COLORS
INSERT INTO `colors` (`id`, `name`, `hex`) VALUES
('col-black', 'Charcoal Black', '#111111'),
('col-white', 'Alabaster White', '#FFFFFF'),
('col-beige', 'Warm Sand', '#E6DFD3'),
('col-rose', 'Rose Dust', '#D4A5A5'),
('col-sage', 'Sage Moss', '#8A9A86');

-- 2. SEED SIZES
INSERT INTO `sizes` (`id`, `name`, `display_order`) VALUES
('sz-s', 'S', 1),
('sz-m', 'M', 2),
('sz-l', 'L', 3),
('sz-xl', 'XL', 4);

-- 3. SEED WAREHOUSES
INSERT INTO `warehouses` (`id`, `name`, `location`) VALUES
('wh-main', 'Central Distribution Center', 'Colombo HQ'),
('wh-store-colombo', 'Colombo Flagship Store', 'Galle Road'),
('wh-store-kandy', 'Kandy Premium Store', 'Kandy City Center');

-- 4. SEED CATEGORIES
INSERT INTO `categories` (`id`, `name`, `description`, `image`) VALUES
('cat-skirt', 'Skirts', 'Flowing sarong wraps, pleated satin midis, and structured skirts.', 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=600&auto=format&fit=crop&q=80'),
('cat-blouse', 'Blouse', 'Sheer organza, batik resort shirts, and draped silk blouses.', 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=600&auto=format&fit=crop&q=80'),
('cat-croptop', 'Crop top', 'Bespoke ribbed crop tops, corseted silhouettes, and knit crops.', 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=600&auto=format&fit=crop&q=80'),
('cat-shorts', 'Shorts', 'Pleated linen shorts, high-waisted resort shorts, and sartorial fits.', 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=600&auto=format&fit=crop&q=80'),
('cat-pants', 'Pants', 'French flax linen wide-leg trousers, tailored pants, and slacks.', 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=600&auto=format&fit=crop&q=80'),
('cat-dress', 'Dress', 'Couture sari drape dresses, silk slip dresses, and kaftans.', 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=600&auto=format&fit=crop&q=80');

-- 5. SEED PRODUCTS
INSERT INTO `products` (`id`, `name`, `slug`, `brand`, `description`, `short_description`, `category`, `gender`, `material`, `fit`, `care_instructions`, `rating`, `review_count`, `is_new_arrival`, `is_best_seller`, `is_sale`, `base_price`, `compare_at_price`, `images_json`) VALUES
('prod-satin-dress', 'Sigiriya Silk Sari-Inspired Drape Dress', 'sigiriya-silk-sari-inspired-drape-dress', 'Ceylon Couture', 'A modern homage to traditional Sri Lankan heritage. A beautifully unstructured bias-cut luxury dress featuring a high-neck asymmetrical sash drape reminiscent of a Kandyan sari.', 'Asymmetric bias-cut mulberry silk sari-inspired drape dress.', 'Dress', 'Women', '100% Pure Mulberry Silk', 'Asymmetric bias drape', 'Dry clean recommended. Hand wash cold.', 4.90, 184, 1, 1, 0, 12500.00, 15000.00, '["https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800&auto=format&fit=crop&q=80"]'),
('prod-pleated-dress', 'Bentota Handloom Kaftan Dress', 'bentota-handloom-kaftan-dress', 'Ceylon Studio', 'Crafted by master weavers in the coastal town of Bentota, Sri Lanka. This luxurious resort kaftan dress features custom woven indigo pinstripes.', 'Hand-loomed organic cotton kaftan dress with custom pinstripes.', 'Dress', 'Women', '100% Hand-loomed Organic Cotton', 'Relaxed resort kaftan drape', 'Gentle machine wash cold inside out.', 4.80, 96, 1, 0, 0, 9500.00, NULL, '["https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=800&auto=format&fit=crop&q=80"]'),
('prod-organza-blouse', 'Hikkaduwa Indigo Batik Resort Blouse', 'hikkaduwa-indigo-batik-resort-blouse', 'Ceylon Couture', 'Featuring individual hand-cracked organic indigo dye patterns created by veteran batik artisans in Hikkaduwa, Sri Lanka.', 'Camp-collar resort blouse with hand-cracked indigo batik dye patterns.', 'Blouse', 'Women', '100% Fine Mercerized Cotton Batik', 'Relaxed camp collar regular fit', 'Dry clean only.', 4.70, 65, 1, 1, 0, 6800.00, 8500.00, '["https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=800&auto=format&fit=crop&q=80"]'),
('prod-cashmere-crop', 'Ceylon Tea-Trails Silk Ribbed Crop Top', 'ceylon-tea-trails-silk-ribbed-crop-top', 'Ceylon Knitwear', 'Spun from ultra-soft silk blend rib-knit. Features a sleek high neck, tailored arm cutouts, and a flattering cropped waistband.', 'Premium fine rib-knit silk cropped top.', 'Crop top', 'Women', '70% Mulberry Silk, 30% Fine Cashmere', 'Tailored fitted crop silhouette', 'Hand wash cold, lay flat to dry.', 5.00, 42, 0, 1, 0, 5400.00, 6800.00, '["https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=800&auto=format&fit=crop&q=80"]'),
('prod-satin-skirt', 'Unawatuna Golden Hour Sarong Skirt', 'unawatuna-golden-hour-sarong-skirt', 'Ceylon Studio', 'Capturing the liquid gold of Unawatuna beaches at dusk. This beautiful draped sarong midi skirt features a high-rise waist.', 'Liquid-shine draped sarong wrap skirt with elegant side-tie.', 'Skirts', 'Women', '92% Heavy Silk Satin, 8% Elastane', 'High-waisted draped sarong wrap', 'Machine wash cold in delicate bag.', 4.80, 78, 0, 1, 1, 5800.00, 7200.00, '["https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=800&auto=format&fit=crop&q=80"]'),
('prod-linen-trousers', 'Galle Fort Linen Tailored Pants', 'galle-fort-linen-tailored-pants', 'Ceylon Studio', 'Sartorial luxury designed for warm tropical weather. Impeccably cut from heavy-weight French flax linen.', 'High-rise pleated wide-leg French flax linen pants.', 'Pants', 'Women', '100% Organic French Flax Linen', 'High-waisted wide-leg sartorial fit', 'Dry clean recommended.', 4.70, 112, 0, 0, 0, 8200.00, NULL, '["https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=800&auto=format&fit=crop&q=80"]');

-- 6. SEED PROMO COUPONS
INSERT INTO `coupons` (`code`, `type`, `value`, `min_spend`, `max_discount`, `is_active`, `description`, `show_as_popup`, `popup_title`, `popup_subtitle`, `popup_badge`, `popup_bg_theme`, `expires_at`, `active_days_json`) VALUES
('FESTIVE20', 'PERCENTAGE', 20.00, 5000.00, NULL, 1, '20% off sartorial collections above Rs.5,000', 1, '⚡ Island Festive Flash Sale!', 'Enjoy 20% instant deduction on your total couture bill on orders above Rs. 5,000.', 'LIMITED TIME EXCLUSIVE', 'gold', '2026-11-30 23:59:59', '["Mon","Tue","Wed","Thu","Fri","Sat","Sun"]'),
('WELCOME10', 'PERCENTAGE', 10.00, 2000.00, NULL, 1, '10% off your first luxury order, minimum spend Rs.2,000', 0, NULL, NULL, NULL, 'gold', NULL, NULL),
('SARTORIAL3000', 'FIXED', 3000.00, 15000.00, NULL, 1, 'Save Rs.3,000 on premium fits above Rs.15,000', 0, NULL, NULL, NULL, 'gold', NULL, NULL),
('FREESHIP', 'PERCENTAGE', 0.00, 5000.00, NULL, 1, 'Free delivery on premium selections above Rs.5,000', 0, NULL, NULL, NULL, 'gold', NULL, NULL);

-- 7. SEED SIZE MEASUREMENT RULES
INSERT INTO `size_measurement_rules` (`id`, `size_label`, `size_code`, `bust_min_inches`, `bust_max_inches`, `waist_min_inches`, `waist_max_inches`, `hips_min_inches`, `hips_max_inches`, `shoulder_inches`, `length_inches`, `notes`) VALUES
('rule-s', 'Small (S)', 'S', 32.00, 34.00, 25.00, 27.00, 35.00, 37.00, 14.50, 38.00, 'Ideal for bust 32"-34", waist 25"-27", hips 35"-37". Petite & slim tailoring.'),
('rule-m', 'Medium (M)', 'M', 35.00, 37.00, 28.00, 30.00, 38.00, 40.00, 15.00, 39.50, 'Ideal for bust 35"-37", waist 28"-30", hips 38"-40". Regular standard couture fit.'),
('rule-l', 'Large (L)', 'L', 38.00, 40.00, 31.00, 33.00, 41.00, 43.00, 15.50, 41.00, 'Ideal for bust 38"-40", waist 31"-33", hips 41"-43". Comfortable relaxed drape.'),
('rule-xl', 'Extra Large (XL)', 'XL', 41.00, 44.00, 34.00, 37.00, 44.00, 47.00, 16.20, 42.50, 'Ideal for bust 41"-44", waist 34"-37", hips 44"-47". Generous couture silhouette.');

SET FOREIGN_KEY_CHECKS = 1;
