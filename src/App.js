import {
  createContext,
  useContext,
  useMemo,
  useEffect,
  useState,
  useRef,
  useReducer
} from 'react';
import { Input, Button, Checkbox } from 'antd';
import './App.css';

class State {
  data = []
};

function appReducer(state, action) {
  switch (action.type) {
    case 'ADD': {
      const { data } = state;
      data.unshift(action.payload);
      return {
        ...state,
        data
      };
    }
    case 'UPDATE_STATE': {
      const { data } = state;
      const { index, done } = action.payload;
      data[index].done = done;
      return {
        ...state,
        data
      };
    }
    case 'UPDATE_VALUE': {
      const { data } = state;
      const { index, value } = action.payload;
      data[index].value = value;
      return {
        ...state,
        data
      };
    }
    case 'UPDATE_ALL_STATE': {
      const { data } = state;
      const { done } = action.payload;
      data.forEach(item => {
        item.done = done;
      });
      return {
        ...state,
        data
      };
    }
    case 'REMOVE': {
      const { data } = state;
      const { index } = action.payload;
      data.splice(index, 1);
      return {
        ...state,
        data
      };
    }
    case 'REMOVE_ALL_DONE': {
      const { data } = state;
      return {
        ...state,
        data: data.filter(item => !item.done)
      };
    }
    default:
      return state;
  }
};

const AppContext = createContext();

const MyInput = props => {
  const {
    blurEvent,
    enterEvent,
    value
  } = props;
  const [inputValue, setInputValue] = useState(value ? value : '');

  const ref = useRef(document.getElementById('myInput'));

  useEffect(() => {
    ref.current.focus();
  }, []);

  const handleChange = e => {
    setInputValue(e.target.value);
  }

  const handleEnter = (e, eventFn = enterEvent) => {
    eventFn && eventFn(e.target.value ? e.target.value : value);
  };

  const handleBlur = e => {
    blurEvent && handleEnter(e, blurEvent);
  };

  return (
    <Input
      id='myInput'
      ref={ref}
      value={inputValue}
      onChange={handleChange}
      onPressEnter={handleEnter}
      onBlur={handleBlur}
    />
  )
};

const Header = () => {
  console.log('header render');
  const [_, dispatch] = useContext(AppContext);

  const enterEvent = value => {
    dispatch({
      type: 'ADD',
      payload: { value, done: false }
    });
  }

  return useMemo(() => {
    console.log('memo header render');
    return (
      <header className='Header'>
        <h1>TodoList</h1>
        <MyInput enterEvent={enterEvent} />
      </header>
    );
  }, []);
};

const Footer = () => {
  console.log('footer render');
  const [{ data }, dispatch] = useContext(AppContext);
  const [doneCount, setDoneCount] = useState(0);
  const [doingCount, setDoingCount] = useState(0);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    let doneCount = 0, doingCount = 0;
    data.forEach(item => {
      if (item.done) {
        doneCount++;
      } else {
        doingCount++;
      }
    });
    setDoingCount(doingCount);
    setDoneCount(doneCount);
  });

  useEffect(() => {
    let checked = data.length > 0 && data.every(item => item.done);
    setChecked(checked);
  });

  const updateAllState = e => {
    dispatch({
      type: 'UPDATE_ALL_STATE',
      payload: { done: e.target.checked }
    });
  }

  const removeALLDone = () => {
    dispatch({ type: 'REMOVE_ALL_DONE' });
  }

  return (
    <footer className='Footer'>
      <Checkbox checked={checked} onChange={updateAllState} />
      <h3>
        已完成：<span style={{ color: 'blue' }}>{doneCount}</span>
        <span style={{ margin: '0 10px' }}>/</span>
        未完成：<span style={{ color: 'red' }}>{doingCount}</span>
      </h3>
      <Button onClick={removeALLDone}>删除全部已完成事项</Button>
    </footer>
  );
};

const WorkItem = props => {

  const { done, value, index } = props;
  const [_, dispatch] = useContext(AppContext);
  const [doubleState, setDoubleState] = useState(false);

  const enterEvent = value => {
    dispatch({
      type: 'UPDATE_VALUE',
      payload: { value, index }
    });
    setDoubleState(false);
  }

  const blurEvent = value => {
    enterEvent(value);
  }

  const updateState = e => {
    dispatch({
      type: 'UPDATE_STATE',
      payload: { done: e.target.checked, index }
    });
  }

  const handleRemove = () => {
    dispatch({
      type: 'REMOVE',
      payload: { index }
    });
  }

  return (
    <div className='WorkItem'>
      <Checkbox checked={done} onChange={updateState} />
      <div style={{ width: '80%' }}>
        {
          doubleState ?
            (
              <MyInput
                value={value}
                enterEvent={enterEvent}
                blurEvent={blurEvent}
              />
            )
            :
            (
              <h5
                style={{
                  cursor: 'pointer',
                  textDecoration: done ? 'line-through' : 'none',
                  color: done ? '#ccc' : '#000'
                }}
                onDoubleClick={() => setDoubleState(true)}
              >
                {value}
              </h5>
            )
        }
      </div>
      <Button onClick={handleRemove}>删除</Button>
    </div>
  );
}

const Main = () => {
  console.log('main render');
  const [{ data }] = useContext(AppContext);

  return (
    data.length > 0 && (
      <main className='Main'>
        {
          data.map((work, index) => <WorkItem key={index} {...work} index={index} />)
        }
      </main>
    )
  );
};

function TodoList() {

  const [state, dispatch] = useReducer(appReducer, new State());

  return (
    <AppContext.Provider value={[state, dispatch]}>
      <div style={{ padding: 20 }}>
        <Header />
        <Main />
        <Footer />
      </div>
    </AppContext.Provider>
  );
}

export default TodoList;
