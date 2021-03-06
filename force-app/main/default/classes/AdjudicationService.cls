public with sharing class AdjudicationService {
    
    private static Set<Id> queuedIds = new Set<Id>();

    public static void evaluateFuture(Id caseId, Boolean assignOwner) {
        if (queuedIds.contains(caseId)) return;

        runEvaluateFuture(caseId, assignOwner);
        
        queuedIds.add(caseId);
    }

    @future(callout=true)
    private static void runEvaluateFuture(Id caseId, Boolean assignOwner) {
        evaluate(caseId, assignOwner);
    }

    public static void evaluate(Id caseId) {
        evaluate(caseId, false);
    }

    public static void evaluate(Id caseId, Boolean assignOwner) {
        SpecialAuthorityRequest sar = new SobjectSarBuilder(caseId).build(); 
        
        evaluate(sar, assignOwner);

        update sar.saCase;
    }

    private static void evaluate(SpecialAuthorityRequest sar, Boolean assignOwner) {
        queuedIds.add(sar.saCase.Id);
        
        AdjudicationStrategy strategy = AdjudicationStrategyFactory.getStrategy(sar, assignOwner);
        
        strategy.runEvaluate();
    }

}
