-- Referral Code Usage Analytics Queries
-- Use these queries to track which referral codes were used how many times

-- 1. Basic referral code usage count from orders table
SELECT 
    referral_code_used,
    COUNT(*) as total_orders,
    SUM(discount_amount) as total_discount_given,
    SUM(team_member_credit) as total_team_member_earnings
FROM public.orders 
WHERE referral_code_used IS NOT NULL 
    AND referral_code_used != ''
GROUP BY referral_code_used
ORDER BY total_orders DESC;

-- 2. Detailed referral usage tracking with user info
SELECT 
    rc.code as referral_code,
    rc.team_member_name,
    COUNT(rut.id) as total_usage_count,
    COUNT(CASE WHEN rut.usage_type = 'signup' THEN 1 END) as signup_count,
    COUNT(CASE WHEN rut.usage_type = 'checkout' THEN 1 END) as checkout_count,
    SUM(rut.discount_applied) as total_discount_applied,
    SUM(rut.team_member_credit) as total_earnings,
    MIN(rut.created_at) as first_usage,
    MAX(rut.created_at) as last_usage
FROM public.referral_codes rc
LEFT JOIN public.referral_usage_tracking rut ON rc.code = rut.referral_code_used
GROUP BY rc.code, rc.team_member_name
ORDER BY total_usage_count DESC;

-- 3. Daily referral usage breakdown
SELECT 
    DATE(rut.created_at) as usage_date,
    rut.referral_code_used,
    COUNT(*) as daily_usage_count,
    SUM(rut.discount_applied) as daily_discount,
    SUM(rut.team_member_credit) as daily_earnings
FROM public.referral_usage_tracking rut
WHERE rut.created_at >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY DATE(rut.created_at), rut.referral_code_used
ORDER BY usage_date DESC, daily_usage_count DESC;

-- 4. Top performing referral codes (last 30 days)
SELECT 
    rc.code as referral_code,
    rc.team_member_name,
    COUNT(rut.id) as usage_count,
    SUM(rut.discount_applied) as total_discount,
    SUM(rut.team_member_credit) as total_earnings,
    ROUND(AVG(rut.team_member_credit), 2) as avg_earning_per_order
FROM public.referral_codes rc
LEFT JOIN public.referral_usage_tracking rut ON rc.code = rut.referral_code_used
WHERE rut.created_at >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY rc.code, rc.team_member_name
HAVING COUNT(rut.id) > 0
ORDER BY usage_count DESC, total_earnings DESC;

-- 5. Referral code performance by team member
SELECT 
    rc.team_member_name,
    COUNT(DISTINCT rc.code) as total_codes_assigned,
    COUNT(rut.id) as total_usage_count,
    SUM(rut.discount_applied) as total_discount_given,
    SUM(rut.team_member_credit) as total_earnings,
    ROUND(SUM(rut.team_member_credit) / COUNT(rut.id), 2) as avg_earning_per_usage
FROM public.referral_codes rc
LEFT JOIN public.referral_usage_tracking rut ON rc.code = rut.referral_code_used
GROUP BY rc.team_member_name
ORDER BY total_earnings DESC;

-- 6. Check specific referral code usage (replace 'PULKIT123' with any code)
SELECT 
    rut.referral_code_used,
    rut.usage_type,
    rut.discount_applied,
    rut.team_member_credit,
    rut.created_at,
    p.full_name as user_name,
    p.email as user_email
FROM public.referral_usage_tracking rut
LEFT JOIN public.profiles p ON rut.user_id = p.id
WHERE rut.referral_code_used = 'PULKIT123'
ORDER BY rut.created_at DESC;

-- 7. Monthly referral usage summary
SELECT 
    TO_CHAR(rut.created_at, 'YYYY-MM') as month,
    COUNT(*) as total_referral_usage,
    COUNT(DISTINCT rut.referral_code_used) as unique_codes_used,
    SUM(rut.discount_applied) as total_discount_given,
    SUM(rut.team_member_credit) as total_earnings_paid
FROM public.referral_usage_tracking rut
WHERE rut.created_at >= CURRENT_DATE - INTERVAL '12 months'
GROUP BY TO_CHAR(rut.created_at, 'YYYY-MM')
ORDER BY month DESC;

-- 8. Users who used referral codes most frequently
SELECT 
    p.full_name,
    p.email,
    COUNT(rut.id) as referral_usage_count,
    STRING_AGG(DISTINCT rut.referral_code_used, ', ') as codes_used,
    SUM(rut.discount_applied) as total_discount_received
FROM public.referral_usage_tracking rut
JOIN public.profiles p ON rut.user_id = p.id
GROUP BY p.id, p.full_name, p.email
HAVING COUNT(rut.id) > 1
ORDER BY referral_usage_count DESC;

-- 9. Inactive referral codes (never used)
SELECT 
    rc.code,
    rc.team_member_name,
    rc.created_at as code_created_at
FROM public.referral_codes rc
LEFT JOIN public.referral_usage_tracking rut ON rc.code = rut.referral_code_used
WHERE rut.id IS NULL AND rc.is_active = true
ORDER BY rc.created_at;

-- 10. Referral code effectiveness (usage vs time active)
SELECT 
    rc.code,
    rc.team_member_name,
    rc.created_at as code_created_at,
    COUNT(rut.id) as total_usage,
    EXTRACT(DAYS FROM CURRENT_DATE - rc.created_at) as days_active,
    CASE 
        WHEN EXTRACT(DAYS FROM CURRENT_DATE - rc.created_at) > 0 
        THEN ROUND(COUNT(rut.id)::numeric / EXTRACT(DAYS FROM CURRENT_DATE - rc.created_at), 2)
        ELSE 0 
    END as usage_per_day
FROM public.referral_codes rc
LEFT JOIN public.referral_usage_tracking rut ON rc.code = rut.referral_code_used
WHERE rc.is_active = true
GROUP BY rc.code, rc.team_member_name, rc.created_at
ORDER BY usage_per_day DESC;
