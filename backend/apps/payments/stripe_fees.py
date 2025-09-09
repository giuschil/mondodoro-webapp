"""
Stripe fees calculator for Mondodoro
"""
from decimal import Decimal, ROUND_UP
from typing import Tuple


class StripeFeeCalculator:
    """Calculate Stripe fees for different card types and scenarios"""
    
    # Stripe fees for different regions (as of 2024)
    EU_CARD_PERCENTAGE = Decimal('0.014')  # 1.4%
    EU_CARD_FIXED = Decimal('0.25')       # €0.25
    
    NON_EU_CARD_PERCENTAGE = Decimal('0.029')  # 2.9%
    NON_EU_CARD_FIXED = Decimal('0.25')       # €0.25
    
    @classmethod
    def calculate_fees(cls, amount: Decimal, is_eu_card: bool = True) -> Tuple[Decimal, Decimal, Decimal]:
        """
        Calculate Stripe fees for a given amount
        
        Args:
            amount: Transaction amount in euros
            is_eu_card: Whether the card is from EU (default: True)
            
        Returns:
            Tuple of (total_fees, percentage_fee, fixed_fee)
        """
        if is_eu_card:
            percentage_fee = amount * cls.EU_CARD_PERCENTAGE
            fixed_fee = cls.EU_CARD_FIXED
        else:
            percentage_fee = amount * cls.NON_EU_CARD_PERCENTAGE
            fixed_fee = cls.NON_EU_CARD_FIXED
        
        total_fees = percentage_fee + fixed_fee
        
        return total_fees, percentage_fee, fixed_fee
    
    @classmethod
    def calculate_net_amount(cls, gross_amount: Decimal, is_eu_card: bool = True) -> Decimal:
        """
        Calculate net amount after Stripe fees
        
        Args:
            gross_amount: Amount sent by user
            is_eu_card: Whether the card is from EU
            
        Returns:
            Net amount received by jeweler
        """
        total_fees, _, _ = cls.calculate_fees(gross_amount, is_eu_card)
        return gross_amount - total_fees
    
    @classmethod
    def calculate_gross_amount_needed(cls, target_net_amount: Decimal, is_eu_card: bool = True) -> Decimal:
        """
        Calculate gross amount needed to receive a specific net amount
        
        Args:
            target_net_amount: Desired net amount
            is_eu_card: Whether the card is from EU
            
        Returns:
            Gross amount to charge to achieve target net amount
        """
        if is_eu_card:
            percentage = cls.EU_CARD_PERCENTAGE
            fixed = cls.EU_CARD_FIXED
        else:
            percentage = cls.NON_EU_CARD_PERCENTAGE
            fixed = cls.NON_EU_CARD_FIXED
        
        # Formula: gross = (target + fixed) / (1 - percentage)
        gross_amount = (target_net_amount + fixed) / (Decimal('1') - percentage)
        
        # Round up to nearest cent
        return gross_amount.quantize(Decimal('0.01'), rounding=ROUND_UP)
    
    @classmethod
    def calculate_collection_split(cls, target_amount: Decimal, num_contributors: int, 
                                 is_eu_card: bool = True, include_fees: bool = True) -> dict:
        """
        Calculate how to split a collection among contributors
        
        Args:
            target_amount: Target amount to collect (net)
            num_contributors: Number of contributors
            is_eu_card: Whether cards are from EU
            include_fees: Whether to include fees in the split
            
        Returns:
            Dictionary with calculation details
        """
        if include_fees:
            # Calculate total gross amount needed
            total_gross = cls.calculate_gross_amount_needed(target_amount, is_eu_card)
            per_person_gross = (total_gross / num_contributors).quantize(Decimal('0.01'), rounding=ROUND_UP)
            total_collected = per_person_gross * num_contributors
            
            # Calculate actual fees
            total_fees, _, _ = cls.calculate_fees(total_collected, is_eu_card)
            net_received = total_collected - total_fees
            
        else:
            # Simple split without considering fees
            per_person_gross = (target_amount / num_contributors).quantize(Decimal('0.01'), rounding=ROUND_UP)
            total_collected = per_person_gross * num_contributors
            total_fees, _, _ = cls.calculate_fees(total_collected, is_eu_card)
            net_received = total_collected - total_fees
        
        return {
            'target_amount': target_amount,
            'per_person_amount': per_person_gross,
            'total_collected': total_collected,
            'total_fees': total_fees,
            'net_received': net_received,
            'fee_percentage': (total_fees / total_collected * 100).quantize(Decimal('0.01')),
            'surplus_or_deficit': net_received - target_amount,
            'num_contributors': num_contributors,
            'include_fees': include_fees
        }


def format_stripe_calculation(calculation: dict) -> str:
    """Format calculation results for display"""
    return f"""
🎯 Obiettivo: €{calculation['target_amount']}
👥 Contributori: {calculation['num_contributors']}
💰 Quota per persona: €{calculation['per_person_amount']}

📊 Totale raccolto: €{calculation['total_collected']}
💳 Commissioni Stripe: €{calculation['total_fees']} ({calculation['fee_percentage']}%)
✅ Netto ricevuto: €{calculation['net_received']}

{'✅ Surplus' if calculation['surplus_or_deficit'] >= 0 else '❌ Deficit'}: €{abs(calculation['surplus_or_deficit'])}
"""


# Example usage and tests
if __name__ == "__main__":
    calculator = StripeFeeCalculator()
    
    # Test case 1: €10 transaction
    print("=== Test €10 EU Card ===")
    fees, perc, fixed = calculator.calculate_fees(Decimal('10.00'))
    net = calculator.calculate_net_amount(Decimal('10.00'))
    print(f"Fees: €{fees} (€{perc} + €{fixed})")
    print(f"Net: €{net}")
    
    # Test case 2: Collection split
    print("\n=== Collection Split Example ===")
    result = calculator.calculate_collection_split(
        target_amount=Decimal('100.00'),
        num_contributors=10,
        include_fees=True
    )
    print(format_stripe_calculation(result))
