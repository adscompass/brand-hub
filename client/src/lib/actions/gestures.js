export function gestures(node, params = {}) {
  let {
    enabled = true,
    preventWheel = true,
    doubleTapTime = 300,
    holdTime = 500,
    moveThreshold = 5,
    swipeTime = 250,
    swipeMinDistance = 30,
    transformPoint = (p) => p,
    throttleTime = 16,
    capture = true,
  } = params;

  const pointers = new Map();

  const initialState = {
    isPressed: false,
    isHolding: false,
    isPanning: false,
    isPinching: false,
    isRotating: false,

    startTime: 0,
    lastTime: 0,

    startX: 0,
    startY: 0,

    lastX: 0,
    lastY: 0,

    initialDistance: 0,
    initialAngle: 0,
  };

  const state = { ...initialState };

  let doubleTapTimeout = null;
  let holdTimeout = null;

  function getDistance(p1, p2) {
    return Math.sqrt(
      Math.pow(p1.clientX - p2.clientX, 2) +
        Math.pow(p1.clientY - p2.clientY, 2),
    );
  }

  function getAngle(p1, p2) {
    return (
      (Math.atan2(p2.clientY - p1.clientY, p2.clientX - p1.clientX) * 180) /
      Math.PI
    );
  }

  function getSwipeDirection(deltaX, deltaY) {
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      return deltaX > 0 ? 'right' : 'left';
    } else {
      return deltaY > 0 ? 'down' : 'up';
    }
  }

  function dispatch(eventName, detail = {}) {
    node.dispatchEvent(new CustomEvent(eventName, { detail }));
  }

  function updateState(updates) {
    Object.assign(state, updates);
    dispatch('statechange', { ...state });
  }

  function reset() {
    pointers.clear();
    updateState({ ...initialState });
  }

  function resetHold() {
    clearTimeout(holdTimeout);
    holdTimeout = null;
  }

  function buildEventDetail(event, customData = {}) {
    const transformedPoint = transformPoint({
      x: event.offsetX,
      y: event.offsetY,
    });

    const detail = {
      ...customData,
      shiftKey: event.shiftKey,
      ctrlKey: event.ctrlKey,
      altKey: event.altKey,
      metaKey: event.metaKey,
      originalEvent: event,
      x: event.clientX,
      y: event.clientY,
      offsetX: event.offsetX,
      offsetY: event.offsetY,
      worldX: transformedPoint.x,
      worldY: transformedPoint.y,
      pressure: event.pressure,
      tiltX: event.tiltX,
      tiltY: event.tiltY,
    };

    return detail;
  }

  function throttle(callback, delay) {
    let timeoutId = null;
    let lastArgs = null;

    const timeoutCallback = () => {
      if (lastArgs) {
        callback(...lastArgs);
        lastArgs = null;
        timeoutId = setTimeout(timeoutCallback, delay);
      } else {
        timeoutId = null;
      }
    };

    const throttled = (...args) => {
      lastArgs = args;
      if (!timeoutId) {
        callback(...args);
        timeoutId = setTimeout(timeoutCallback, delay);
      }
    };

    throttled.cancel = () => {
      clearTimeout(timeoutId);
      timeoutId = null;
      lastArgs = null;
    };

    return throttled;
  }

  let throttledPan, throttledMove, throttledPinch, throttledRotate;

  function setupThrottlers(limit) {
    if (throttledPan) throttledPan.cancel();
    if (throttledMove) throttledMove.cancel();
    if (throttledPinch) throttledPinch.cancel();
    if (throttledRotate) throttledRotate.cancel();

    if (limit > 0) {
      const createThrottledDispatcher = (eventName) =>
        throttle((detail) => dispatch(eventName, detail), limit);
      throttledPan = createThrottledDispatcher('pan');
      throttledMove = createThrottledDispatcher('move');
      throttledPinch = createThrottledDispatcher('pinch');
      throttledRotate = createThrottledDispatcher('rotate');
    } else {
      const directDispatcher = (eventName) => {
        const dispatcher = (detail) => dispatch(eventName, detail);
        dispatcher.cancel = () => {};
        return dispatcher;
      };
      throttledPan = directDispatcher('pan');
      throttledMove = directDispatcher('move');
      throttledPinch = directDispatcher('pinch');
      throttledRotate = directDispatcher('rotate');
    }
  }

  setupThrottlers(throttleTime);

  function onPointerDown(event) {
    if (!enabled) return;
    event.preventDefault();
    if (capture) {
      node.setPointerCapture(event.pointerId);
    }
    pointers.set(event.pointerId, {
      clientX: event.clientX,
      clientY: event.clientY,
    });

    if (pointers.size === 2) {
      resetHold();

      const [p1, p2] = Array.from(pointers.values());
      const distance = getDistance(p1, p2);
      const angle = getAngle(p1, p2);

      updateState({
        isPinching: true,
        isRotating: true,
        isPanning: false,
        initialDistance: distance,
        initialAngle: angle,
      });

      dispatch('pinchstart', buildEventDetail(event, { distance }));
      dispatch('rotatestart', buildEventDetail(event, { angle }));
    } else if (pointers.size === 1) {
      updateState({
        isPressed: true,
        startTime: Date.now(),
        startX: event.clientX,
        startY: event.clientY,
        lastX: event.clientX,
        lastY: event.clientY,
      });

      dispatch('down', buildEventDetail(event, { button: event.button }));
      if (event.button === 0) {
        holdTimeout = setTimeout(() => {
          dispatch('hold', buildEventDetail(event));
          updateState({ isHolding: true });
          resetHold();
        }, holdTime);
      }
    }
  }

  function onPointerMove(event) {
    if (!enabled) return;
    event.preventDefault();

    if (pointers.has(event.pointerId)) {
      pointers.set(event.pointerId, {
        clientX: event.clientX,
        clientY: event.clientY,
      });
    }

    if (pointers.size === 2) {
      const [p1, p2] = Array.from(pointers.values());
      const currentDistance = getDistance(p1, p2);
      const currentAngle = getAngle(p1, p2);

      const scale = currentDistance / state.initialDistance;
      const rotation = currentAngle - state.initialAngle;

      if (state.isPinching) {
        throttledPinch(buildEventDetail(event, { scale }));
      }
      if (state.isRotating) {
        throttledRotate(buildEventDetail(event, { rotation }));
      }
    } else if (pointers.size === 1) {
      if (state.isPressed) {
        updateState({
          lastX: event.clientX,
          lastY: event.clientY,
          lastTime: Date.now(),
        });
      }

      if (
        Math.sqrt(
          (event.clientX - state.startX) ** 2 +
            (event.clientY - state.startY) ** 2,
        ) > moveThreshold
      ) {
        if (!state.isPanning && state.isPressed) {
          updateState({ isPanning: true });
          resetHold();
          dispatch('panstart', buildEventDetail(event));
        }

        if (state.isPanning) {
          throttledPan(buildEventDetail(event));
        } else {
          throttledMove(buildEventDetail(event));
        }
      }
    }
  }

  function onPointerUp(event) {
    if (!enabled) return;
    event.preventDefault();
    node.releasePointerCapture(event.pointerId);

    const wasTwoPointers = pointers.size === 2;

    pointers.delete(event.pointerId);

    if (wasTwoPointers) {
      throttledPinch.cancel();
      throttledRotate.cancel();
      if (state.isPinching) {
        dispatch('pinchend', buildEventDetail(event));
      }
      if (state.isRotating) {
        dispatch('rotateend', buildEventDetail(event));
      }
      updateState({
        isPinching: false,
        isRotating: false,
        initialDistance: 0,
        initialAngle: 0,
      });
    }

    if (pointers.size === 0) {
      updateState({ isPressed: false });
      resetHold();

      dispatch('up', buildEventDetail(event, { button: event.button }));
      if (state.isPanning) {
        throttledPan.cancel();
        throttledMove.cancel();
        const duration = state.lastTime - state.startTime;
        const distance = Math.sqrt(
          (state.lastX - state.startX) ** 2 + (state.lastY - state.startY) ** 2,
        );
        if (duration < swipeTime && distance > swipeMinDistance) {
          const deltaX = state.lastX - state.startX;
          const deltaY = state.lastY - state.startY;
          const direction = getSwipeDirection(deltaX, deltaY);

          const detail = buildEventDetail(event, {
            deltaX,
            deltaY,
            direction,
            button: event.button,
          });
          dispatch('swipe', detail);
          dispatch(`swipe${direction}`, detail);
        } else {
          dispatch('panend', buildEventDetail(event));
        }
      }
      switch (event.button) {
        case 0:
          if (
            !state.isHolding &&
            !doubleTapTimeout &&
            !state.isPanning &&
            !wasTwoPointers
          ) {
            const trueTarget = document.elementFromPoint(
              event.clientX,
              event.clientY,
            );
            const detail = buildEventDetail(event, { trueTarget: trueTarget });
            dispatch('tap', detail);
          }

          if (!doubleTapTimeout) {
            doubleTapTimeout = setTimeout(() => {
              clearTimeout(doubleTapTimeout);
              doubleTapTimeout = null;
            }, doubleTapTime);
          } else {
            dispatch('double', buildEventDetail(event));
            clearTimeout(doubleTapTimeout);
            doubleTapTimeout = null;
          }
          break;
        case 1:
          dispatch('middle', buildEventDetail(event));
          break;
      }
      reset();
    }
  }

  function onContext(event) {
    if (!enabled) return;
    event.preventDefault();
    if (event.pointerType === 'touch') {
      return;
    }
    dispatch('context', buildEventDetail(event));
  }

  function onWheel(event) {
    if (!enabled) return;
    if (preventWheel) {
      event.preventDefault();
    }

    dispatch(
      'zoom',
      buildEventDetail(event, {
        deltaX: event.deltaX,
        deltaY: event.deltaY,
        deltaZ: event.deltaZ,
      }),
    );
  }

  function onPointerCancel(event) {
    throttledPan.cancel();
    throttledMove.cancel();
    throttledPinch.cancel();
    throttledRotate.cancel();
    if (pointers.has(event.pointerId)) {
      pointers.delete(event.pointerId);
    }
    if (state.isPinching || state.isRotating) {
      if (state.isPinching) dispatch('pinchend', buildEventDetail(event));
      if (state.isRotating) dispatch('rotateend', buildEventDetail(event));
    }
    clearTimeout(holdTimeout);
    clearTimeout(doubleTapTimeout);
    holdTimeout = null;
    doubleTapTimeout = null;
    if (pointers.size === 0) {
      reset();
    }
  }

  function onPointerEnter(event) {
    if (!enabled) return;
    event.preventDefault();
    dispatch('hoverstart', buildEventDetail(event));
  }

  function onPointerLeave(event) {
    if (!enabled) return;
    event.preventDefault();
    dispatch('hoverend', buildEventDetail(event));
  }

  node.addEventListener('pointerdown', onPointerDown);
  node.addEventListener('contextmenu', onContext);
  node.addEventListener('pointermove', onPointerMove);
  node.addEventListener('pointerup', onPointerUp);
  node.addEventListener('wheel', onWheel);
  node.addEventListener('pointerenter', onPointerEnter);
  node.addEventListener('pointerleave', onPointerLeave);
  node.addEventListener('pointercancel', onPointerCancel);

  return {
    update(newParams) {
      const oldThrottleTime = throttleTime;
      params = { ...params, ...newParams };
      ({
        enabled,
        doubleTapTime,
        holdTime,
        moveThreshold,
        swipeTime,
        swipeMinDistance,
        transformPoint,
        throttleTime,
      } = params);
      if (throttleTime !== oldThrottleTime) {
        setupThrottlers(throttleTime);
      }
    },

    destroy() {
      node.removeEventListener('pointerdown', onPointerDown);
      node.removeEventListener('contextmenu', onContext);
      node.removeEventListener('pointermove', onPointerMove);
      node.removeEventListener('pointerup', onPointerUp);
      node.removeEventListener('wheel', onWheel);
      node.removeEventListener('pointerenter', onPointerEnter);
      node.removeEventListener('pointerleave', onPointerLeave);
      node.removeEventListener('pointercancel', onPointerCancel);

      clearTimeout(holdTimeout);
      clearTimeout(doubleTapTimeout);
      throttledPan.cancel();
      throttledMove.cancel();
      throttledPinch.cancel();
      throttledRotate.cancel();

      holdTimeout = null;
      doubleTapTimeout = null;
      pointers.clear();
    },
  };
}
