import React, {Component} from 'react';
import './styles.css'

import ChordScaleController from './Controller/ChordScale/index';
import InstrumentController from './Controller/Instrument/index';
import EmptyController from './Controller/Empty/index';
import ChordTypeRadio from './radio/ChordType'; //need these radios for their defaultValues
import ScaleTypeRadio from './radio/ScaleType';
import EditChordRadio from './radio/EditChord';
import EditScaleRadio from './radio/EditScale';
import SettingsRadio from './radio/Settings';

import { fapi_getModes, 
    fapi_getScalesFromModeName, 
    fapi_getChords, 
    fapi_getChordNearbys,
    fapi_getScaleNearbys,
    fapi_getTunings,
    fapi_getInstruments,
    fapi_isValidTextTuning,
    fapi_getChordsFromUserString,
    fapi_getScalesFromUserString,
    fapi_getAllTonewood,
    fapi_getOrientations,
    fapi_getAllPianoOctaves,
}  from '../../services/api/index';


/* if this code doesnt work correctly, it means the media queries when we start running out of height wont work properly, and this would be the biggest issue in landscape mode
    on smaller/mobile devices */
function getLandScapeClassName({base, focus, view, navSearchGets, textSearchGets, selection, radio, instrument}) {
    if (typeof myVar === "string") {throw new TypeError("'base' must be of type 'string'");}

    let classString = base.concat(" ");
    if (listIsVisible(view, focus, navSearchGets, textSearchGets, radio, selection, instrument)) {classString = classString.concat("with-list "); }
    if (radioIsVisible(view, focus)) {classString = classString.concat("with-radio ");}
    if (notenavIsVisible(view, focus)) {classString = classString.concat("with-notenav ")}
    if (toggleIsVisible(view, focus, selection)) {classString = classString.concat("with-toggle ")}

    return classString;
}

function toggleIsVisible(view, focus, selection) {
    if (focus === "settings") { return InstrumentController.toggleIsVisible(); }
    return ChordScaleController.toggleIsVisible(view[focus], selection);
}

function notenavIsVisible(view, focus) {
    if (focus === "settings") {return InstrumentController.notenavIsVisible();}
    return ChordScaleController.notenavIsVisible(view[focus]);
}

function radioIsVisible(view, focus) {
    if (focus === "settings") { return InstrumentController.radioIsVisible(); }
    return ChordScaleController.radioIsVisible(view[focus]);
}

function listIsVisible(view, focus, navSearchGets, textSearchGets, radio, selection, instrument) {
    if (focus === "settings") { return InstrumentController.listIsVisible(view[focus], radio.settings, instrument); }
    return ChordScaleController.listIsVisible(view[focus], navSearchGets, textSearchGets, selection)
}



class SPA extends Component{

    constructor(props) {
        super(props);
        this.state = {
            chord: {
                root: "E",
                name: "E Major",
                symbol: "E",
                notes: [{label: "E", value: 7},{label: "G#", value: 11}, {label: "B", value: 2}]
            },
            scale: {
                root: "E",
                name: "E Lydian",
                notes: [
                    {label: "E", value: 7},
                    {label: "F#", value: 9}, 
                    {label: "G#", value: 11}, 
                    {label: "A#", value: 1}, 
                    {label: "B", value: 2}, 
                    {label: "C#", value: 4}, 
                    {label: "D#", value: 6}
                ]
            },
            toggle: {
                // The toggle is visible when the focus is scale or chord and the other is not null (calculate it)
                scale: true,
                chord: true,
            },
            noteSelect: { 
                chord: {
                    value: "7",
                    label: "E",
                    customListIsOpen: false,
                },
                scale: {
                    value: "8",
                    label: "F",
                    customListIsOpen: false,
                }
            },
            radio: {
                settings: null, //this would just default on mounting,
                chord: {
                    edit: null,
                    nav: null,
                },
                scale: {
                    edit: null,
                    nav: null,
                },
            },
            textInput: {
                settings: null,
                chord: null,
                scale: null,
            },
            //TODO/ New Addition: list
            list: {
                chord: {
                    nav: null,
                    edit: null,
                },
                modal: {
                    chord: true, //I'd like the low-heigh modals to be on by default on website entry. Even though you can't
                    scale: true, //    use some of the controls with modal on (theoretically?), the defaults are user friendly 
                    settings: true,
                }
                //TODO: Add settings, scale
            },
            focus: "chord", // "chord", "scale", "settings", null ---this is with regard to all the controls
            visualizerFocus: "chord", //"chord, "scale"  --this is what the visual instrument is set to
            view: {
                scale: "selected", // "selected", "search", "Navearch"
                chord: "selected", // navsearch is the list of modes that link to [navmode] 
                settings: "navsearch",
                scaleNavSearchMode: null,
            },
            instrument: {
                name: "Guitar",
                tuning: "EADGBE",
                pianoOctaves: 2,
                tonewood: "Rosewood",
                orientation: "Right-Handed"
            },
        };

        this.onFooterUpdate = this.onFooterUpdate.bind(this);
        this.onChordDeselect = this.onChordDeselect.bind(this);
        this.onScaleDeselect = this.onScaleDeselect.bind(this);
        this.toScaleSearchView = this.toScaleSearchView.bind(this);
        this.toChordSearchView = this.toChordSearchView.bind(this);
        this.toChordNavSearchView = this.toChordNavSearchView.bind(this);
        this.toScaleNavSearchView = this.toScaleNavSearchView.bind(this);
        
        this.toChordEditView = this.toChordEditView.bind(this);
        this.toScaleEditView = this.toScaleEditView.bind(this);

        this.toModeNavSearchView = this.toModeNavSearchView.bind(this);

        this.handleCustomClickOutsideNoteNav = this.handleCustomClickOutsideNoteNav.bind(this);
        this.handleCustomNoteNavSelectClick = this.handleCustomNoteNavSelectClick.bind(this);
        this.onNoteSelectionUpdate = this.onNoteSelectionUpdate.bind(this);
        this.onRadioUpdate = this.onRadioUpdate.bind(this);

        this.onNavSearchModeItemClick = this.onNavSearchModeItemClick.bind(this);
        this.onNavSearchChordItemClick = this.onNavSearchChordItemClick.bind(this);
        this.onNavSearchScaleItemClick = this.onNavSearchScaleItemClick.bind(this);

        // these two might be redundant to the above 2
        this.onSearchChordItemClick = this.onSearchChordItemClick.bind(this);
        this.onSearchScaleItemClick = this.onSearchScaleItemClick.bind(this);

        this.toTuningTextInputView = this.toTuningTextInputView.bind(this);
        this.toSettingsNavView = this.toSettingsNavView.bind(this);

        this.onTuningTextChange = this.onTuningTextChange.bind(this);

        this.selectTextTuningButtonClick = this.selectTextTuningButtonClick.bind(this);
        this.onScaleSearchTextChange = this.onScaleSearchTextChange.bind(this);
        this.onChordSearchTextChange = this.onChordSearchTextChange.bind(this);

        this.handleToggleClick = this.handleToggleClick.bind(this);

        this.onTuningNavSearchItemClick = this.onTuningNavSearchItemClick.bind(this);
        this.onInstrumentNavSearchItemClick = this.onInstrumentNavSearchItemClick.bind(this);
        this.onTonewoodNavSearchItemClick = this.onTonewoodNavSearchItemClick.bind(this);
        this.onOrientationItemClick = this.onOrientationItemClick.bind(this);
        this.onOctaveItemClick = this.onOctaveItemClick.bind(this);
        
        this.onListModalExitClick = this.onListModalExitClick.bind(this);
        this.openListModal = this.openListModal.bind(this);

        this.onTextEnterKeyUp = this.onTextEnterKeyUp.bind(this);

        

        
        
    }

    onFooterUpdate(newValue) {   
        this.setState((state, props) => {
          const sameValue = (state.focus === newValue);
          const visFocusIsChordOrScale = (newValue === "chord" || newValue === "scale");

        //if (sameValue && visFocusIsChordOrScale) {//keep focus value and set view to "selected"}
        //if (sameValue && !visFocusIsChordOrScale) {// set focus to null}
        //if !sameValue {// set focus to newValue}

        //todo: refactor divergent returns
        
        let newFocus;

        if (sameValue) {
            // if sameValue && visFocusIsChordOrScale, keep focus value, otherwise !visFocusIsChordOrScale so set to null
            newFocus =  visFocusIsChordOrScale ? state.focus : null;

            /*if (state.focus === "scale" && (!state.primary && state.view.scale === "selected"))  {
                return {
                    ...state, //copy it
                  focus: newFocus,
                  //if 'chord' or 'scale' let it update, otherwise keep the old value, visfocus can only be chord or scale
                  visualizerFocus: visFocusIsChordOrScale ? newValue: state.visualizerFocus,
                  view: {
                      ...state.view,
                      [state.focus]: (sameValue && visFocusIsChordOrScale) ? "navsearch" : state.view[state.focus],
                  }
                }
            }*/

            if (state.focus === "scale" && (!state.primary && state.view.scale === "search"))  {
                return {
                    ...state, //copy it
                  focus: newFocus,
                  //if 'chord' or 'scale' let it update, otherwise keep the old value, visfocus can only be chord or scale
                  visualizerFocus: visFocusIsChordOrScale ? newValue: state.visualizerFocus,
                  view: {
                      ...state.view,
                      [state.focus]: (sameValue && visFocusIsChordOrScale) ? "selected" : state.view[state.focus],
                  }
                }
            }

            if (state.focus === "scale" && (state.view.scale === "search" || state.view.scale === "navsearchmode")) {
                return {
                    ...state, //copy it
                  focus: newFocus,
                  //if 'chord' or 'scale' let it update, otherwise keep the old value, visfocus can only be chord or scale
                  visualizerFocus: visFocusIsChordOrScale ? newValue: state.visualizerFocus,
                  view: {
                      ...state.view,
                      [state.focus]: (sameValue && visFocusIsChordOrScale) ? "navsearch" : state.view[state.focus],
                  }
                }
            }
        } else {
            // not sameValue, so we need to update
            newFocus = newValue;
        }

          return {
              ...state, //copy it
            focus: newFocus,
            //if 'chord' or 'scale' let it update, otherwise keep the old value, visfocus can only be chord or scale
            visualizerFocus: visFocusIsChordOrScale ? newValue: state.visualizerFocus,
            view: {
                ...state.view,
                [state.focus]: (sameValue && visFocusIsChordOrScale) ? "selected" : state.view[state.focus],
            }
          }
        });




      
    }

    onChordDeselect() {
        this.setState((state, props) => {
            return {
                ...state,
                chord: null
            }
        });
    }

    onScaleDeselect() {
        this.setState((state, props) => {
            return {
                ...state,
                scale: null
            }
        });
    }

    toChordSearchView() {
        this.setState((state, props) => {
            return {
                ...state,
                view: {
                    ...state.view,
                    chord: "search"
                }
            }
        });
    }

    toScaleSearchView() {
        this.setState((state, props) => {
            return {
                ...state,
                view: {
                    ...state.view,
                    scale: "search"
                }
            }
        });
    }

    toChordNavSearchView(state) {
        //when directed to chord nav search view, we fetch chords for the search view based on search view user settings and update the state, thereby re-rendering
        const fetchChords = async (state) => {
            const radioValue = state.radio.chord.nav ? state.radio.chord.nav : ChordTypeRadio.defaultValue;
 
            let chords;
            try {
                chords = await fapi_getChords(parseInt(state.noteSelect.chord.value), radioValue, state.scale);
            }

            catch(err){
                console.log(err);
                console.log("badddddd");
                return;
            }

            chords = JSON.parse(chords);
            console.log(chords);

            if(Array.isArray(chords)){

                chords = chords.map(chord => {
                    console.log(chord);
                    return {   
                        "label": chord.name,
                        "object": chord
                    };
                });

                this.setState((state, props) => {
                    //TODO? Do we want to honor prior list state (if any) or keep user snapped to the current chord selection?
                    // We currently honor prior list state as it's easier
 
                    // adding static property defaultValue to radios

                    const tempnewList = {
                        ...state.list,
                        chord: {
                            ...state.list.chord,
                            nav: chords,
                        }
                    };

                    console.log("tempnewList");
                    console.log(tempnewList);

                    //okay so the list is set correctly. Is the list not being referenced correctly?
 
                    return {
                        ...state,
                        view: {
                            ...state.view,
                            chord: "navsearch",
                        },
                        //set list to this.state.list.chord.nav
                        list: {
                            ...state.list,
                            chord: {
                                ...state.list.chord,
                                nav: chords,
                            }
                        }
                    }
                });
            }
        }
       return fetchChords(this.state);
    }

    toScaleNavSearchView() {
        this.setState((state, props) => {
            return {
                ...state,
                view: {
                    ...state.view,
                    scale: "navsearch"
                }
            }
        });
    }

    toModeNavSearchView(mode) {
        this.setState((state, props) => {
            return {
                ...state,
                view: {
                    ...state.view,
                    scale: "navsearchmode"
                }
            }
        });
    }

    toChordEditView() {
        this.setState((state, props) => {
            return {
                ...state,
                view: {
                    ...state.view,
                    chord: "edit"
                }
            }
        });
    }

    toScaleEditView() {
        this.setState((state, props) => {
            return {
                ...state,
                view: {
                    ...state.view,
                    scale: "edit"
                }
            }
        });
    }

    toTuningTextInputView() {
        this.setState((state, props) => {
            return {
                ...state,
                view: {
                    ...state.view,
                    settings: "textEnter"
                }
            }
        });
    }

    // Note Nav State stuff
    handleCustomClickOutsideNoteNav(event, noteSelectNode, which) {
        // Abort if it's not an outside click
        if (noteSelectNode.contains(event.target)) {return;}


        this.setState((state, props) => {
            const whichObj = state.noteSelect[which];

            return {
                ...state,
                noteSelect: {
                    ...state.noteSelect,
                    [which]: {
                        ...whichObj,
                    customListIsOpen: false
                    }
                },
            }
        });
    }
    handleCustomNoteNavSelectClick(event, which) {

        this.setState((state, props) => {
            const whichObj = state.noteSelect[which];

            return {
                ...state,
                noteSelect: {
                    ...state.noteSelect,
                    [which]: {
                        ...whichObj,
                        customListIsOpen: !state.noteSelect[which].customListIsOpen
                    }
                },
            };
        });
    }

    
    onNoteSelectionUpdate(updated, which) {

        this.setState((state, props) => {
            const whichObj = state.noteSelect[which];

            return {
                ...state,
                noteSelect: {
                    ...state.noteSelect,
                    [which]: {
                        ...whichObj,
                        value: updated.value,
                        label: updated.label
                    }
                },
            };
        });
    }

    // radio stuff
    onRadioUpdate(updated, name) {
        let which;

        if (name.includes("Type")) {
            which = "nav";
        } else if (name.includes("Edit")) {
            which = "edit";
        }
        else if (name === "Settings") {
            which = "settings";
        }

        this.setState((state, props) => {
            const radioFocus = state.radio[state.focus];
            const whichObj = radioFocus ? radioFocus[which] : null;

            if (state.focus === "settings") {
                return {
                    ...state,
                    radio: {
                        ...state.radio,
                        [state.focus]: updated
                    }
                };
            } else {
                return {
                    ...state,
                    radio: {
                        ...state.radio,
                        [state.focus]: {
                            ...radioFocus,
                            [which]: updated
                        }
                    }
                };
            }
            

        });
    }

    //nav search stuff
    onNavSearchScaleItemClick(e, item) {
        // click from a scale navsearch menu (list of modes)
        // should open menu for mode where items are scales to select
      
        
        this.setState((state, props) => {
            return {
                ...state,
                view: {
                    ...state.view,
                    scale: "navsearchmode",
                    scaleNavSearchMode: item.label
                },
            };
        });

    }

    onNavSearchChordItemClick(e, item) {
        // click chord item to select

        //convert from {label: ddd} to {item.name}
        //const newItem = {name: item.name};
        console.log("onNavSearchChordItemClick");
        console.log(item);
        this.setState((state, props) => {
            return {
                ...state,
                chord: item,
                view: {
                    ...state.view,
                    chord: "selected"
                    
                }
            };
        });

    }

    onNavSearchModeItemClick(e, item) {
        // click scale item to select
        console.log("onNavSearchModeItemClick");
        this.setState((state, props) => {
            return {
                ...state,
                scale: item,
                view: {
                    ...state.view,
                    scale: "selected"
                }
            };
        });

    }

    toSettingsNavView() {
        this.setState((state, props) => {
            return {
                ...state,
                view: {
                    ...state.view,
                    settings: "navsearch",
                },
            };
        });
    }

    onTuningTextChange(event) {
        const evt = event.nativeEvent.target.value;

        this.setState((state, props) => {
            return {
                ...state,
                textInput: {
                    ...state.textInput,
                    settings: evt,
                },
            };
        });
    }

    selectTextTuningButtonClick() {
        this.setState((state, props) => {
            //TODO: there should be a converter from text input to array maybe
            const newTuning = state.textInput.settings;

            return {
                ...state,
                textInput: {
                    ...state.textInput,
                    settings: null,
                },
                instrument: {
                    ...state.instrument,
                    tuning: newTuning
                },
                textInput: {
                    //reset text input state
                    ...state.textInput,
                    settings: ""
                },
                focus: null //kick them out to the instrument
            };
        });
    }

    onChordSearchTextChange(event) {
        const evt = event.nativeEvent.target.value;

        this.setState((state, props) => {
            return {
                ...state,
                textInput: {
                    ...state.textInput,
                    chord: evt,
                },
            };
        });
    }

    onScaleSearchTextChange(event) {
        const evt = event.nativeEvent.target.value;

        this.setState((state, props) => {
            return {
                ...state,
                textInput: {
                    ...state.textInput,
                    scale: evt,
                },
            };
        });
    }

    onSearchScaleItemClick(e, item) {
        // click from a scale navsearch menu (list of modes)
        // should open menu for mode where items are scales to select
        console.log("onSearchScaleItemClick");
        console.log(item);
      
        
        this.setState((state, props) => {
            return {
                ...state,
                scale: item,
                view: {
                    ...state.view,
                    scale: "selected"
                    
                },
                textInput: {
                    //reset text input state
                    ...state.textInput,
                    scale: ""
                },
            };
        });

    }

    onSearchChordItemClick(e, item) {
        // click chord item to select

        //convert from {label: ddd} to {item.name}
        console.log("onSearchChordItemClick");
        console.log(item);

        const newItem = {name: item.name};

        this.setState((state, props) => {
            return {
                ...state,
                chord: item.object,
                view: {
                    ...state.view,
                    chord: "selected"
                    
                },
                textInput: {
                    //reset text input state
                    ...state.textInput,
                    chord: ""
                },
            };
        });

    }

     /* delete this when options state is working */
     handleToggleClick(event) {
        this.setState((state, props) => {
            return {
                toggle: {
                    ...state.toggle,
                    [state.focus]: !state.toggle[state.focus]
                }
            };
        });
      }

    onTuningNavSearchItemClick(e, item) {
        this.setState((state, props) => {
            return {
                ...state,
                instrument: {
                    ...state.instrument,
                    tuning: item.label
                },
                textInput: {
                    //reset text input state
                    ...state.textInput,
                    settings: ""
                },
                focus: state.visualizerFocus, //want to snap back to whatever we were viewing. time in settings is done
            };
        });
    }

    onInstrumentNavSearchItemClick(e, item) {
        this.setState((state, props) => {
            return {
                ...state,
                instrument: {
                    ...state.instrument,
                    name: item.label
                },
                focus: state.visualizerFocus, //want to snap back to whatever we were viewing. time in settings is done
            };
        });
    }

    onTonewoodNavSearchItemClick(e, item) {
        this.setState((state, props) => {
            return {
                ...state,
                instrument: {
                    ...state.instrument,
                    tonewood: item.label
                },
                focus: state.visualizerFocus, //want to snap back to whatever we were viewing. time in settings is done
            };
        });
    }

    onOctaveItemClick(e, item) {
        this.setState((state, props) => {
            return {
                ...state,
                instrument: {
                    ...state.instrument,
                    pianoOctaves: Number(item.label)
                },
                focus: state.visualizerFocus, //want to snap back to whatever we were viewing. time in settings is done
            };
        });
    }

    onOrientationItemClick(e, item) {
        this.setState((state, props) => {
            return {
                ...state,
                instrument: {
                    ...state.instrument,
                    orientation: item.label
                },
                focus: state.visualizerFocus, //want to snap back to whatever we were viewing. time in settings is done
            };
        });
    }

    onListModalExitClick() {
        this.setState((state, props) => {
            return {
                ...state,
                list: {
                    ...state.list,
                    modal: {
                        ...state.list.modal,
                        [state.focus]: false
                    }
                }
            }
        });
    }

    openListModal() {
        this.setState((state, props) => {
            return {
                ...state,
                list: {
                    ...state.list,
                    modal: {
                        ...state.list.modal,
                        [state.focus]: true
                    }
                }
            }
        });
    }

    // when user presses enter in tuning text input, update tuning if it's valid
    onTextEnterKeyUp(e, component) {
        if (e.keyCode === 13) {
            //enter
            
        
            //update the tuning in state
            this.setState((state, props) => {

                // but if it's not valid, set the state to the same
                if (!fapi_isValidTextTuning(component.value, state.instrument.name)) {
                    console.log("bad tuning");
                    return state;
                }

                return {
                    ...state,
                    instrument: {
                        ...state.instrument,
                        tuning: component.value
                    },
                    textInput: {
                        //reset text input state
                        ...state.textInput,
                        settings: ""
                    },
                    focus: state.visualizerFocus
                };
            });
        }  
    }
 



    render() {

        let contents;

        console.log("this.state");
        console.log(this.state);

        let toggle;
        let search;
        let viewSwitch;
        let radio;
        let selection;
        let visualizer;
        let footer;

        let landscapeClassName = "options ";
        //this.state.focus refers to whether the musicViewManager (visualInstrumentManager)? is in chord, scale, settings, or null state
        //NOT whether the visualizer is focused on a single chord or scale
        switch(this.state.focus) {
            case "chord":
                toggle = {
                    onClick: this.handleToggleClick, //is using 'this' okay
                    value: this.state.toggle.chord,
                };
                search = {
                    text: {
                        get: fapi_getChordsFromUserString,
                        input: this.state.textInput.chord,
                        onChange: this.onChordSearchTextChange,
                        onItemClick: this.onSearchChordItemClick,
                    },
                    nav: {
                        chordList: this.state.list.chord.nav,
                        onItemClick: this.onNavSearchChordItemClick,
                        gets: true, //just for now using this to signify that the user has a list. later it will be something connected to a database call
                    },
                    noteSelect: {
                        handleClickOutside: this.handleCustomClickOutsideNoteNav,
                        onUpdate: this.onNoteSelectionUpdate,
                        handleCustomClick: this.handleCustomNoteNavSelectClick,
                        note: this.state.noteSelect.chord,
                        customListIsOpen: this.state.noteSelect.chord.customListIsOpen,
                    },
                    listModal: {
                        on: this.state.list.modal.chord,
                        open: this.openListModal,
                        onExitClick: this.onListModalExitClick, //a function that sets this listModal off when they press the X on the modal
                    }
                };
                viewSwitch = {
                    toEdit: this.toChordEditView,
                    toNav: this.toChordNavSearchView,
                    toSearch: this.toChordSearchView,
                };
     
                radio = this.state.radio.chord;
                radio.onUpdate = this.onRadioUpdate;

                selection = {
                    primary: this.state.chord,
                    secondary: this.state.scale,
                    onDeselect: this.onChordDeselect,
                    getNearbys: fapi_getChordNearbys,
                };

                footer = {
                    onUpdate: this.onFooterUpdate,
                    selectedValue: this.state.focus,
                };

                search.limitByOther = toggle.value === true ? selection.secondary : null;
                search.gets = (search.text.input !== null && search.text.input !== "") && search.text.get(search.text.input, search.limitByOther);
                toggle.isRequired = selection.secondary;

                landscapeClassName = getLandScapeClassName({
                    base: "options",
                    focus: this.state.focus,
                    view: this.state.view,
                    textSearchGets: search.gets,
                    selection: selection,
                    radio: this.state.radio,
                    navSearchGets: search.nav.gets,
                    instrument: this.state.instrument
                });
                     
                //add visual for fretboard,piano
                let notes = [];
                if (this.state.chord && Array.isArray(this.state.chord.notes)) {
                    notes = this.state.chord.notes;
                }

                visualizer = {
                    selectedNotes: notes.map((note) => note.label), //str like "E"
                    instrument: this.state.instrument, //obj with .name (str) and tuning (str like "EADGBE" (guitar only)) and pianoOctaves (int (piano only)) quick+hacky I know
                };
                contents = <ChordScaleController footer={footer} visualizer={visualizer} toggle={toggle} search={search} view={this.state.view.chord} viewSwitch={viewSwitch} radio={radio} selection={selection} type="chord" />
                break;
            case "scale":
                toggle = {
                    onClick: this.handleToggleClick, //is using 'this' okay
                    value: this.state.toggle.scale,
                };
                search = {
                    text: {
                        get: fapi_getScalesFromUserString,
                        input: this.state.textInput.scale,
                        onChange: this.onScaleSearchTextChange,
                        onItemClick: this.onSearchScaleItemClick,
                    },
                    nav: {
                        //scaleList: this.state.list.scale.nav, //why doesnt scale need this but chord does
                        onScaleItemClick: this.onNavSearchScaleItemClick,
                        onModeItemClick: this.onNavSearchModeItemClick,
                        mode: this.state.view.scaleNavSearchMode,
                        gets: true, //just for now using this to signify that the user has a list. later it will be something connected to a database call
                    },
                    noteSelect: {
                        handleClickOutside: this.handleCustomClickOutsideNoteNav,
                        onUpdate: this.onNoteSelectionUpdate,
                        handleCustomClick: this.handleCustomNoteNavSelectClick,
                        note: this.state.noteSelect.scale,
                        customListIsOpen: this.state.noteSelect.scale.customListIsOpen,
                    },
                    listModal: {
                        on: this.state.list.modal.scale,
                        open: this.openListModal,
                        onExitClick: this.onListModalExitClick, //a function that sets this listModal off when they press the X on the modal
                    }
                };
                viewSwitch = {
                    toEdit: this.toScaleEditView,
                    toNav: this.toScaleNavSearchView,
                    toModeNav: this.toModeNavSearchView,
                    toSearch: this.toScaleSearchView,
                };

                radio = this.state.radio.scale;
                radio.onUpdate = this.onRadioUpdate;
              
                selection = {
                    primary: this.state.scale,
                    secondary: this.state.chord,
                    onDeselect: this.onScaleDeselect,
                    getNearbys: fapi_getScaleNearbys,
                };
                let modes = {
                    getScalesFromModeName: fapi_getScalesFromModeName,
                    get: fapi_getModes,
                };

                footer = {
                    onUpdate: this.onFooterUpdate,
                    selectedValue: this.state.focus,
                };

                search.limitByOther = toggle.value === true ? selection.secondary : null;
                search.gets = (search.text.input !== null && search.text.input !== "") && search.text.get(search.text.input, search.limitByOther);
                toggle.isRequired = selection.secondary;

                landscapeClassName = getLandScapeClassName({
                    base: "options",
                    focus: this.state.focus,
                    view: this.state.view,
                    textSearchGets: search.gets,
                    selection: selection,
                    radio: this.state.radio,
                    navSearchGets: search.nav.gets,
                    instrument: this.state.instrument
                });

                //add visual for fretboard,piano
                let notess = [];
                if (this.state.scale && Array.isArray(this.state.scale.notes)) {
                    notess = this.state.scale.notes;
                }
                visualizer = {
                    selectedNotes: notess.map((note) => note.label), //str like "E"
                    instrument: this.state.instrument, //obj with .name (str) and tuning (str like "EADGBE" (guitar only)) and pianoOctaves (int (piano only)) quick+hacky I know
                };
                contents = <ChordScaleController footer={footer} visualizer={visualizer} modes={modes} view={this.state.view.scale} toggle={toggle} search={search} viewSwitch={viewSwitch} radio={radio} selection={selection} type="scale" />
                break;
            case "settings":
                search = {
                    text: {
                        input: this.state.textInput.settings,
                        onEnterKeyUp: this.onTextEnterKeyUp,
                    },
                    nav: {
                        onInstrumentItemClick: this.onInstrumentNavSearchItemClick,
                        onTonewoodItemClick: this.onTonewoodNavSearchItemClick,
                        onOrientationItemClick: this.onOrientationItemClick,
                        onTuningItemClick: this.onTuningNavSearchItemClick,
                        selectTextTuning: this.selectTextTuningButtonClick,
                        onOctaveItemClick: this.onOctaveItemClick,
                    },
                    listModal: {
                        on: this.state.list.modal.settings,
                        open: this.openListModal,
                        onExitClick: this.onListModalExitClick, //a function that sets this listModal off when they press the X on the modal
                    }
                };

                let tuning = {
                    textInput: this.state.textInput.settings,
                    isValidTextTuning: fapi_isValidTextTuning,
                    onTextChange: this.onTuningTextChange,
                    toTextInputView: this.toTuningTextInputView,
                    getTunings: fapi_getTunings,
                };
                
                radio = this.state.radio.settings;
                let onRadioUpdate = this.onRadioUpdate;
              
                let instruments = {
                    name: this.state.instrument.name,
                    getAll: fapi_getInstruments,
                    getAllTonewood: fapi_getAllTonewood,
                    getOrientations: fapi_getOrientations,
                    getAllPianoOctaves: fapi_getAllPianoOctaves,
                };

                footer = {
                    onUpdate: this.onFooterUpdate,
                    selectedValue: this.state.focus,
                };


                landscapeClassName = getLandScapeClassName({
                    base: "options",
                    focus: this.state.focus,
                    view: this.state.view,
                    list: true, //always a list in settings
                    toggle: false, //no toggle in settings
                    radio: this.state.radio,
                    instrument: this.state.instrument
                });


                //add visual for fretboard,piano
                let notesss = [];
                if (this.state[this.state.visualizerFocus] && Array.isArray(this.state[this.state.visualizerFocus].notes)) {
                    notesss = this.state[this.state.visualizerFocus].notes;
                }
                visualizer = {
                    selectedNotes: notesss.map((note) => note.label), //str like "E"
                    instrument: this.state.instrument, //obj with .name (str) and tuning (str like "EADGBE" (guitar only)) and pianoOctaves (int (piano only)) quick+hacky I know
                };

                contents = <InstrumentController footer={footer} visualizer={visualizer} instrument={instruments} search={search} tuning={tuning} radioValue={this.state.radio.settings} onRadioUpdate={this.onRadioUpdate} type="settings" toNavView={this.toSettingsNavView} view={this.state.view.settings} />
                break;
            case null:
                footer = {
                    onUpdate: this.onFooterUpdate,
                    selectedValue: this.state.focus,
                };
                contents = <EmptyController footer={footer} />;
                break;
            default:
                throw new Error("state.focus not a valid option");
        }
        return (
            <div className={landscapeClassName}>
                    {contents}
            </div>
        );
  }
}
  
export default SPA;