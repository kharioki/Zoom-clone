const socket = io('/');
const videoGrid = document.getElementById('video-grid');

const myPeer = new Peer(undefined, {
  host: '/',
  port: '3001'
});

const myVideo = document.createElement('video');
// mute our video
myVideo.muted = true;

navigator.mediaDevices
  .getUserMedia({
    video: true,
    audio: true
  })
  .then(stream => {
    addVideoStream(myVideo, stream);

    // listen to when someone needs to call us
    myPeer.on('call', call => {
      // answer their call and send them our stream
      call.answer(stream);

      // create a video stream
      const video = document.createElement('video');
      call.on('stream', userVideoStream => {
        addVideoStream(video, userVideoStream);
      });
    });

    // allow other users to connect
    socket.on('user-connected', userId => {
      connectToNewUser(userId, stream);
    });
  });

myPeer.on('open', id => {
  socket.emit('join-room', ROOM_ID, id);
});

// connect to new user function
function connectToNewUser(userId, stream) {
  // calling user and sending them our video and audio stream
  const call = myPeer.call(userId, stream);
  const video = document.createElement('video');
  call.on('stream', userVideoStream => {
    addVideoStream(video, userVideoStream);
  });

  // listen to a close event and remove video
  call.on('close', () => {
    video.remove();
  });
}

// add video stream function
function addVideoStream(video, stream) {
  video.srcObject = stream;
  video.addEventListener('loadedmetadata', () => {
    video.play();
  });

  videoGrid.append(video);
}
