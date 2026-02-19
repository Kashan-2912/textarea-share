import { ImageResponse } from 'next/og'
 
// Route segment config
export const runtime = 'edge'
 
// Image metadata
export const size = {
  width: 32,
  height: 32,
}
export const contentType = 'image/png'
 
// Image generation
export default function Icon() {
  return new ImageResponse(
    (
      // ImageResponse JSX element
      <div
        style={{
          fontSize: 24,
          background: '#0f0f0f',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#a8e524',
          borderRadius: 6,
          border: '2px solid #a8e524',
        }}
      >
        <div 
          style={{
            position: 'absolute',
            top: 4,
            right: 4,
            width: 6,
            height: 6,
            background: '#a8e524',
            borderRadius: '50%',
          }}
        />
        <div
          style={{
            width: 14,
            height: 14,
            border: '2px solid #a8e524',
            borderRadius: 2,
            marginTop: 4,
            marginLeft: -4,
          }}
        />
      </div>
    ),
    // ImageResponse options
    {
      ...size,
    }
  )
}
