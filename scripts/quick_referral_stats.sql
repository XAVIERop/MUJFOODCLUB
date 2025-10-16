-- Quick Referral Stats - Simple queries for daily monitoring

-- 1. TODAY'S REFERRAL USAGE
SELECT 
    referral_code_used,
    COUNT(*) as today_usage_count,
    SUM(discount_amount) as today_discount_given,
    SUM(team_member_credit) as today_earnings
FROM public.orders 
WHERE referral_code_used IS NOT NULL 
    AND DATE(created_at) = CURRENT_DATE
GROUP BY referral_code_used
ORDER BY today_usage_count DESC;

-- 2. LAST 7 DAYS REFERRAL PERFORMANCE
SELECT 
    rut.referral_code_used,
    COUNT(*) as usage_count,
    SUM(rut.discount_applied) as total_discount,
    SUM(rut.team_member_credit) as total_earnings
FROM public.referral_usage_tracking rut
WHERE rut.created_at >= CURRENT_DATE - INTERVAL '7 days'
GROUP BY rut.referral_code_used
ORDER BY usage_count DESC;

-- 3. TOP 5 REFERRAL CODES THIS MONTH
SELECT 
    rc.code,
    rc.team_member_name,
    COUNT(rut.id) as usage_count,
    SUM(rut.team_member_credit) as earnings
FROM public.referral_codes rc
LEFT JOIN public.referral_usage_tracking rut ON rc.code = rut.referral_code_used
WHERE rut.created_at >= DATE_TRUNC('month', CURRENT_DATE)
GROUP BY rc.code, rc.team_member_name
ORDER BY usage_count DESC
LIMIT 5;

-- 4. REFERRAL SUMMARY FOR TODAY
SELECT 
    COUNT(*) as total_referral_orders_today,
    COUNT(DISTINCT referral_code_used) as unique_codes_used_today,
    SUM(discount_amount) as total_discount_given_today,
    SUM(team_member_credit) as total_earnings_today
FROM public.orders 
WHERE referral_code_used IS NOT NULL 
    AND DATE(created_at) = CURRENT_DATE;
