import random
import string


def generate_wallet_id():
    """Генерирует уникальный 10-значный WalletId"""
    return ''.join(random.choices(string.digits, k=10))


def calculate_reliability(successful, failed_or_cancelled):
    """Вычисляет процент надёжности"""
    total = successful + failed_or_cancelled
    if total == 0:
        return 100.0
    return round((successful / total) * 100, 1)