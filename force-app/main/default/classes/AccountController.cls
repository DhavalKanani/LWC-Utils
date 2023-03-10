public with sharing class AccountController{
    @AuraEnabled(cacheable = true)
    public static List<Account> getAllAccounts(){
        try{
            return [SELECT Name, Id, BillingState, Phone, Type, AccountNumber, Rating
                    FROM Account];
        } catch (Exception e){
            throw new AuraHandledException(e.getMessage());
        }
    }

}