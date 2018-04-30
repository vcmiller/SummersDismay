using UnityEngine;
using SBR;
using System.Collections.Generic;

#pragma warning disable 649
public abstract class GameManagerSM : SBR.StateMachine {
    public enum StateID {
        Waiting, Running, Voting, PostGame, Insulting
    }

    new private class State : StateMachine.State {
        public StateID id;

        public override string ToString() {
            return id.ToString();
        }
    }

    public GameManagerSM() {
        allStates = new State[5];

        State stateWaiting = new State() {
            id = StateID.Waiting,
            during = State_Waiting,
            transitions = new List<Transition>(1)
        };
        allStates[0] = stateWaiting;

        State stateRunning = new State() {
            id = StateID.Running,
            enter = StateEnter_Running,
            during = State_Running,
            exit = StateExit_Running,
            subMachine = new SubStateMachine(),
            transitions = new List<Transition>(1)
        };
        allStates[1] = stateRunning;

        State stateVoting = new State() {
            id = StateID.Voting,
            enter = StateEnter_Voting,
            during = State_Voting,
            transitions = new List<Transition>(1)
        };
        allStates[2] = stateVoting;

        State statePostGame = new State() {
            id = StateID.PostGame,
            enter = StateEnter_PostGame,
            during = State_PostGame,
            transitions = new List<Transition>(1)
        };
        allStates[3] = statePostGame;

        State stateInsulting = new State() {
            id = StateID.Insulting,
            enter = StateEnter_Insulting,
            during = State_Insulting,
            transitions = new List<Transition>(1)
        };
        allStates[4] = stateInsulting;

        rootMachine.defaultState = stateWaiting;
        stateWaiting.parentMachine = rootMachine;
        stateRunning.parentMachine = rootMachine;
        stateRunning.subMachine.defaultState = stateVoting;
        stateVoting.parent = stateRunning;
        stateVoting.parentMachine = stateRunning.subMachine;
        statePostGame.parent = stateRunning;
        statePostGame.parentMachine = stateRunning.subMachine;
        stateInsulting.parent = stateRunning;
        stateInsulting.parentMachine = stateRunning.subMachine;

        Transition transitionWaitingInsulting = new Transition() {
            from = stateWaiting,
            to = stateInsulting,
            exitTime = 0f,
            mode = StateMachineDefinition.TransitionMode.ConditionOnly,
            cond = TransitionCond_Waiting_Insulting
        };
        stateWaiting.transitions.Add(transitionWaitingInsulting);

        Transition transitionRunningWaiting = new Transition() {
            from = stateRunning,
            to = stateWaiting,
            exitTime = 0f,
            mode = StateMachineDefinition.TransitionMode.ConditionOnly,
            cond = TransitionCond_Running_Waiting
        };
        stateRunning.transitions.Add(transitionRunningWaiting);

        Transition transitionVotingPostGame = new Transition() {
            from = stateVoting,
            to = statePostGame,
            exitTime = 30f,
            mode = StateMachineDefinition.TransitionMode.ConditionOnly,
            cond = TransitionCond_Voting_PostGame
        };
        stateVoting.transitions.Add(transitionVotingPostGame);

        Transition transitionPostGameInsulting = new Transition() {
            from = statePostGame,
            to = stateInsulting,
            exitTime = 5f,
            mode = StateMachineDefinition.TransitionMode.ConditionOnly,
            cond = TransitionCond_PostGame_Insulting
        };
        statePostGame.transitions.Add(transitionPostGameInsulting);

        Transition transitionInsultingVoting = new Transition() {
            from = stateInsulting,
            to = stateVoting,
            exitTime = 60f,
            mode = StateMachineDefinition.TransitionMode.ConditionOnly,
            cond = TransitionCond_Insulting_Voting
        };
        stateInsulting.transitions.Add(transitionInsultingVoting);


    }

    public StateID state {
        get {
            State st = rootMachine.activeLeaf as State;
            return st.id;
        }

        set {
            stateName = value.ToString();
        }
    }

    protected virtual void State_Waiting() { }
    protected virtual void StateEnter_Running() { }
    protected virtual void State_Running() { }
    protected virtual void StateExit_Running() { }
    protected virtual void StateEnter_Voting() { }
    protected virtual void State_Voting() { }
    protected virtual void StateEnter_PostGame() { }
    protected virtual void State_PostGame() { }
    protected virtual void StateEnter_Insulting() { }
    protected virtual void State_Insulting() { }

    protected virtual bool TransitionCond_Waiting_Insulting() { return false; }
    protected virtual bool TransitionCond_Running_Waiting() { return false; }
    protected virtual bool TransitionCond_Voting_PostGame() { return false; }
    protected virtual bool TransitionCond_PostGame_Insulting() { return false; }
    protected virtual bool TransitionCond_Insulting_Voting() { return false; }

}
#pragma warning restore 649
